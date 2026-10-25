"use server";

import { randomBytes } from "node:crypto";
import { client } from "@/sanity/client";
import { getSettings } from "@/sanity/queries";
import { describeSizes, validateOrder, type InspirationUpload, type OrderDraft } from "./order";

export type SubmitResult = { ok: true; reference: string } | { ok: false; problems: string[] };

const ASSET_ID = /^image-[a-f0-9]+-\d+x\d+-[a-z0-9]+$/;

export async function submitCustomOrder(draft: OrderDraft, inspiration: InspirationUpload[]): Promise<SubmitResult> {
  const { shippingCountries, baseColours } = await getSettings();
  const photos = inspiration.filter((p) => ASSET_ID.test(p.assetId)).slice(0, 10);
  const problems = validateOrder(draft, photos.length, shippingCountries);
  if (problems.length > 0) return { ok: false, problems };

  const reference = `FPO-${randomBytes(3).toString("hex").toUpperCase()}`;
  const colour = draft.baseColour === "design" ? "Design decides" : baseColours.find((c) => c.id === draft.baseColour)?.name;

  try {
    const designId =
      draft.setType === "existing" && draft.existingDesign
        ? await client.fetch<string | null>(`*[_type == "design" && slug.current == $slug][0]._id`, { slug: draft.existingDesign })
        : null;

    await client.create({
      _type: "customRequest",
      status: "new",
      reference,
      submittedAt: new Date().toISOString(),
      setType: draft.setType,
      existingDesign: designId ? { _type: "reference", _ref: designId, _weak: true } : undefined,
      vision: draft.vision.trim() || undefined,
      inspiration: photos.map((p, i) => ({
        _key: `photo${i}`,
        _type: "inspirationPhoto",
        image: { _type: "image", asset: { _type: "reference", _ref: p.assetId } },
        credit: p.credit.trim().slice(0, 120) || undefined,
      })),
      shape: draft.shape === "artist" ? "Artist's choice" : draft.shape,
      length: draft.length,
      baseColour: draft.setType === "existing" ? undefined : colour,
      sizes: describeSizes(draft),
      toes: draft.toes,
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(draft.deadline) ? draft.deadline : undefined,
      name: draft.name.trim().slice(0, 120),
      email: draft.email.trim().slice(0, 200),
      instagram: draft.instagram.trim().slice(0, 60) || undefined,
      country: draft.country,
      referral: draft.referral.trim().slice(0, 120) || undefined,
    });
  } catch (error) {
    console.error("Saving custom request failed", error);
    return { ok: false, problems: ["Something went wrong sending your request. Please try again in a moment."] };
  }

  // TODO: email her and the customer via Resend
  return { ok: true, reference };
}
