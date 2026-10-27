import type { NextRequest } from "next/server";
import { after } from "next/server";
import { parseBody } from "next-sanity/webhook";
import type Stripe from "stripe";
import { isCountryCode } from "@/content/countries";
import { site } from "@/content/site";
import { sendPaymentLinkEmail } from "@/lib/emails";
import { stripe, toCents } from "@/lib/stripe";
import { client } from "@/sanity/client";
import { getSettings } from "@/sanity/queries";

type RequestDoc = {
  _id: string;
  reference: string;
  name: string;
  email: string;
  status: string;
  quote?: number;
  countryCode?: string;
  paymentRequestedAt?: string;
  payment?: { linkId?: string; linkSentAt?: string };
};

// Called by a Sanity webhook when she presses “Send payment link” in the Studio
// (it stamps paymentRequestedAt). Creates a single-use Stripe Payment Link for
// the quote, stores it on the request and emails it to the customer.
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!stripe || !secret) return Response.json({ error: "Payments are not configured" }, { status: 503 });

  const { isValidSignature, body } = await parseBody<{ _id?: string }>(request, secret, true);
  if (!isValidSignature) return Response.json({ error: "Invalid signature" }, { status: 401 });
  if (!body?._id) return Response.json({ error: "No document id" }, { status: 400 });

  // Read the published document ourselves rather than trusting the webhook body
  const doc = await client.fetch<RequestDoc | null>(
    `*[_id == $id && _type == "customRequest"][0] { _id, reference, name, email, status, quote, countryCode, paymentRequestedAt, payment }`,
    { id: body._id.replace(/^drafts\./, "") },
  );
  if (!doc?.paymentRequestedAt) return Response.json({ skipped: "no request" });
  // Already handled this press of the button (our own patch below triggers the webhook again)
  if (doc.payment?.linkSentAt && doc.payment.linkSentAt >= doc.paymentRequestedAt) return Response.json({ skipped: "already sent" });
  if (doc.status === "paid") return Response.json({ skipped: "paid" });
  if (!doc.quote || doc.quote < 1 || !doc.email) return Response.json({ skipped: "missing quote or email" });

  // Ship only to the country they asked for; older requests without a code may ship anywhere she ships
  const { shippingCountries } = await getSettings();
  const allowed = isCountryCode(doc.countryCode) ? [doc.countryCode] : shippingCountries.map((c) => c.code);

  const price = await stripe.prices.create({
    currency: "eur",
    unit_amount: toCents(doc.quote),
    product_data: { name: `Custom press-on set ${doc.reference}` },
  });
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    restrictions: { completed_sessions: { limit: 1 } },
    shipping_address_collection: {
      allowed_countries: allowed as Stripe.PaymentLinkCreateParams.ShippingAddressCollection.AllowedCountry[],
    },
    phone_number_collection: { enabled: true },
    metadata: { kind: "custom", requestId: doc._id, reference: doc.reference },
    after_completion: { type: "redirect", redirect: { url: `${site.url}/thank-you?session_id={CHECKOUT_SESSION_ID}` } },
  });

  // A new quote replaces the old link
  if (doc.payment?.linkId) {
    await stripe.paymentLinks.update(doc.payment.linkId, { active: false }).catch((e) => console.error("Deactivating old link failed", e));
  }

  await client
    .patch(doc._id)
    .setIfMissing({ payment: {} })
    .set({
      status: "quoted",
      "payment.linkUrl": link.url,
      "payment.linkId": link.id,
      "payment.linkAmount": doc.quote,
      "payment.linkSentAt": new Date().toISOString(),
    })
    .commit();

  after(() => sendPaymentLinkEmail({ reference: doc.reference, name: doc.name, email: doc.email, amount: doc.quote!, linkUrl: link.url }));
  return Response.json({ sent: true });
}
