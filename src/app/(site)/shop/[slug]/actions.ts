"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { isCountryCode } from "@/content/countries";
import { site } from "@/content/site";
import { presetSizes, type PresetSize } from "@/content/sizing";
import { paymentsEnabled, stripe, toCents } from "@/lib/stripe";
import { client } from "@/sanity/client";
import { squareImageUrl } from "@/sanity/image";
import { getSettings } from "@/sanity/queries";
import { describeSizes, emptyDraft, isValidSize, type Hand } from "../../custom/order";

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

type ProductRow = {
  _id: string;
  name: string;
  price: number | null;
  inStock: boolean | null;
  fulfilment: "made-to-order" | "ready-made" | null;
  readySize: string | null;
  image: { asset?: { _ref: string } } | null;
};

const hand = (value: unknown): Hand => {
  const list = Array.isArray(value) ? value : [];
  return [0, 1, 2, 3, 4].map((i) => (typeof list[i] === "string" ? list[i].slice(0, 6) : "")) as Hand;
};

/** Where Stripe sends the buyer back to: this site, or localhost while developing */
async function returnOrigin() {
  const origin = (await headers()).get("origin") ?? "";
  return /^http:\/\/localhost:\d+$/.test(origin) ? origin : site.url;
}

// Public endpoint: the price, stock and shipping all come from Sanity here,
// never from the browser.
export async function startCheckout(input: unknown): Promise<CheckoutResult> {
  if (!paymentsEnabled || !stripe) return { ok: false, error: "Checkout isn't open yet." };

  const data = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const slug = typeof data.slug === "string" && /^[a-z0-9-]{1,96}$/.test(data.slug) ? data.slug : null;
  if (!slug) return { ok: false, error: "Something went wrong. Please refresh the page." };

  // Fresh read, not the cached one: stock and price must be current
  const product = await client.fetch<ProductRow | null>(
    `*[_type == "design" && forSale == true && slug.current == $slug][0] { _id, name, price, inStock, fulfilment, readySize, "image": images[0] }`,
    { slug },
  );
  if (!product || !product.price || product.price <= 0) return { ok: false, error: "This set isn't for sale right now." };
  if (product.inStock === false) return { ok: false, error: "Sorry, this set just sold out." };

  const { shippingCountries } = await getSettings();
  const country = isCountryCode(data.country) ? shippingCountries.find((c) => c.code === data.country) : undefined;
  if (!country) return { ok: false, error: "Choose where to ship." };

  const fulfilment = product.fulfilment ?? "made-to-order";
  let sizes: string;
  if (fulfilment === "ready-made") {
    sizes = `Ready-made set${product.readySize ? `, size ${product.readySize}` : ""}`;
  } else {
    const size = (typeof data.size === "object" && data.size !== null ? data.size : {}) as Record<string, unknown>;
    if (size.mode === "preset" && typeof size.preset === "string" && size.preset in presetSizes) {
      sizes = describeSizes({ ...emptyDraft, sizeMode: "preset", presetSize: size.preset as PresetSize });
    } else if (size.mode === "measured") {
      const left = hand(size.left);
      const right = hand(size.right);
      if (![...left, ...right].every(isValidSize)) return { ok: false, error: "Add all ten nail widths in millimetres." };
      sizes = describeSizes({ ...emptyDraft, sizeMode: "measured", sizes: { left, right } });
    } else {
      return { ok: false, error: "Choose your size." };
    }
  }

  const reference = `FPS-${randomBytes(3).toString("hex").toUpperCase()}`;
  const origin = await returnOrigin();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "en",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: toCents(product.price),
            product_data: {
              name: product.name,
              description: fulfilment === "ready-made" ? sizes : "Hand-painted to your sizes",
              images: product.image?.asset ? [squareImageUrl(product.image, 600)] : undefined,
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: [country.code as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: country.delivery ? `Shipping to ${country.name} · ${country.delivery}` : `Shipping to ${country.name}`,
            fixed_amount: { amount: toCents(country.price), currency: "eur" },
          },
        },
      ],
      phone_number_collection: { enabled: true },
      metadata: { kind: "shop", reference, designId: product._id, designName: product.name.slice(0, 200), fulfilment, sizes: sizes.slice(0, 490) },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/${slug}`,
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return { ok: true, url: session.url };
  } catch (error) {
    console.error("Creating checkout failed", error);
    return { ok: false, error: "Couldn't open checkout. Please try again in a moment." };
  }
}
