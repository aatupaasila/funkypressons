import { after } from "next/server";
import type Stripe from "stripe";
import { sendCustomPaidEmails, sendShopOrderEmails } from "@/lib/emails";
import { formatAddress, stripe, toEuros } from "@/lib/stripe";
import { client } from "@/sanity/client";

// Stripe calls this when a payment completes. Orders are only ever recorded
// from here (signature-verified), never from the browser coming back.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return Response.json({ error: "Payments are not configured" }, { status: 503 });

  let event: Stripe.Event;
  try {
    // Async version: Workers only have the Web Crypto API
    event = await stripe.webhooks.constructEventAsync(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Card payments complete at once; slower methods (bank transfers etc.) arrive later as async_payment_succeeded
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status !== "paid") return Response.json({ received: true, pending: true });

    if (session.metadata?.kind === "shop") await recordShopOrder(session);
    else if (session.payment_link) await recordCustomPayment(session);
  }

  return Response.json({ received: true });
}

async function recordShopOrder(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const customer = session.customer_details;
  const shipping = session.collected_information?.shipping_details ?? null;
  const documentId = `shopOrder-${session.id}`;
  const amount = toEuros(session.amount_total);
  const shippingPaid = toEuros(session.total_details?.amount_shipping);

  // Stripe may deliver the same event twice; the session id makes this idempotent
  const existing = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: documentId });
  if (existing) return;

  await client.createIfNotExists({
    _id: documentId,
    _type: "shopOrder",
    status: "paid",
    reference: meta.reference,
    paidAt: new Date((session.created ?? Date.now() / 1000) * 1000).toISOString(),
    design: meta.designId ? { _type: "reference", _ref: meta.designId, _weak: true } : undefined,
    designName: meta.designName,
    fulfilment: meta.fulfilment,
    sizes: meta.sizes,
    amountPaid: amount,
    shippingPaid,
    name: shipping?.name ?? customer?.name ?? undefined,
    email: customer?.email ?? undefined,
    phone: customer?.phone ?? undefined,
    shippingAddress: formatAddress(shipping ?? customer),
    stripeSessionId: session.id,
  });

  // A one-off set can't be sold twice
  if (meta.fulfilment === "ready-made" && meta.designId) {
    await client.patch(meta.designId).set({ inStock: false }).commit();
  }

  const name = shipping?.name ?? customer?.name ?? "there";
  const email = customer?.email;
  if (email) {
    after(() =>
      sendShopOrderEmails({
        reference: meta.reference ?? session.id,
        documentId,
        name,
        email,
        rows: [
          ["Set", meta.designName ?? "—"],
          ["Size", meta.sizes ?? "—"],
          ["Paid", `${amount} € (incl. ${shippingPaid} € shipping)`],
          ["Ship to", formatAddress(shipping ?? customer)],
        ],
      }),
    );
  }
}

async function recordCustomPayment(session: Stripe.Checkout.Session) {
  const linkId = typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id;
  const request = await client.fetch<{ _id: string; reference: string; name: string; email: string; payment?: { stripeSessionId?: string } } | null>(
    `*[_type == "customRequest" && payment.linkId == $linkId][0] { _id, reference, name, email, payment }`,
    { linkId },
  );
  if (!request) {
    console.error("Paid payment link matches no custom request", linkId, session.id);
    return;
  }
  if (request.payment?.stripeSessionId === session.id) return; // already recorded

  const amount = toEuros(session.amount_total);
  const shipping = session.collected_information?.shipping_details ?? null;
  await client
    .patch(request._id)
    .set({
      status: "paid",
      "payment.paidAt": new Date().toISOString(),
      "payment.amountPaid": amount,
      "payment.shippingAddress": formatAddress(shipping ?? session.customer_details),
      "payment.stripeSessionId": session.id,
    })
    .commit();

  // The link is single-use; switch it off so it can't be paid twice
  if (linkId) await stripe!.paymentLinks.update(linkId, { active: false }).catch((e) => console.error("Deactivating link failed", e));

  after(() =>
    sendCustomPaidEmails({
      reference: request.reference,
      documentId: request._id,
      name: request.name,
      email: session.customer_details?.email ?? request.email,
      amount,
    }),
  );
}
