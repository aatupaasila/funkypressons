import "server-only";
import Stripe from "stripe";

// Payments are switched on by setting STRIPE_SECRET_KEY. Without it (e.g. on
// hosting that doesn't allow selling yet) the shop shows "opening soon".
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const paymentsEnabled = stripe !== null;

export const toCents = (euros: number) => Math.round(euros * 100);
export const toEuros = (cents: number | null | undefined) => (cents ?? 0) / 100;

/** Multi-line postal address for the Studio */
export function formatAddress(details: { name?: string | null; address?: Stripe.Address | null } | null | undefined) {
  const a = details?.address;
  if (!a) return "";
  return [details?.name, a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(" "), a.state, a.country].filter(Boolean).join("\n");
}
