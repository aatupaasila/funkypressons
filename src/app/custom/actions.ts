"use server";

import { validateOrder, type InspirationMeta, type OrderDraft } from "./order";

export type SubmitResult = { ok: true; reference: string } | { ok: false; problems: string[] };

export async function submitCustomOrder(draft: OrderDraft, inspiration: InspirationMeta[]): Promise<SubmitResult> {
  const problems = validateOrder(draft, inspiration.length);
  if (problems.length > 0) return { ok: false, problems };

  const reference = `FPO-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  // TODO: save the request (and upload the photos) to Sanity, then email her
  // and the customer via Resend. Until that's wired up the request is only logged.
  console.log("New custom order", reference, { draft, inspiration });

  return { ok: true, reference };
}
