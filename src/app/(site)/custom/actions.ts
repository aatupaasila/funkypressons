"use server";

import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { setTypes } from "@/content/order-options";
import { sendRequestEmails } from "@/lib/emails";
import { client } from "@/sanity/client";
import { getSettings } from "@/sanity/queries";
import { describeSizes, validateOrder } from "./order";
import { parseDraft, parseInspiration } from "./parse";

export type SubmitResult = { ok: true; reference: string } | { ok: false; problems: string[] };

const fakeReference = () => `FPO-${randomBytes(3).toString("hex").toUpperCase()}`;

// Arguments are typed `unknown` on purpose: this is callable by anyone, so
// nothing is trusted until parseDraft/parseInspiration have rebuilt it.
export async function submitCustomOrder(draftInput: unknown, inspirationInput: unknown, honeypot: unknown = ""): Promise<SubmitResult> {
  // Bots fill the hidden field; pretend it worked so they don't adapt
  if (typeof honeypot !== "string" || honeypot !== "") return { ok: true, reference: fakeReference() };

  const draft = parseDraft(draftInput);
  if (!draft) return { ok: false, problems: ["Something went wrong sending your request. Please try again."] };
  const photos = parseInspiration(inspirationInput);

  const { shippingCountries, baseColours } = await getSettings();
  const problems = validateOrder(draft, photos.length, shippingCountries);
  if (problems.length > 0) return { ok: false, problems };

  const reference = fakeReference();
  const colour = draft.baseColour === "design" ? "Design decides" : baseColours.find((c) => c.id === draft.baseColour)?.name;
  const shape = draft.shape === "artist" ? "Artist's choice" : draft.shape;
  const sizes = describeSizes(draft);
  const name = draft.name.trim();
  const email = draft.email.trim();
  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(draft.deadline) ? draft.deadline : undefined;

  let documentId: string;
  let designName: string | undefined;
  try {
    const design =
      draft.setType === "existing" && draft.existingDesign
        ? await client.fetch<{ _id: string; name: string } | null>(`*[_type == "design" && slug.current == $slug][0] { _id, name }`, {
            slug: draft.existingDesign,
          })
        : null;
    designName = design?.name;

    const created = await client.create({
      _type: "customRequest",
      status: "new",
      reference,
      submittedAt: new Date().toISOString(),
      setType: draft.setType,
      existingDesign: design ? { _type: "reference", _ref: design._id, _weak: true } : undefined,
      vision: draft.vision.trim() || undefined,
      inspiration: photos.map((p, i) => ({
        _key: `photo${i}`,
        _type: "inspirationPhoto",
        image: { _type: "image", asset: { _type: "reference", _ref: p.assetId } },
        credit: p.credit.trim() || undefined,
      })),
      shape,
      length: draft.length,
      baseColour: draft.setType === "existing" ? undefined : colour,
      sizes,
      toes: draft.toes,
      deadline,
      name,
      email,
      instagram: draft.instagram.trim() || undefined,
      country: draft.country,
      referral: draft.referral.trim() || undefined,
    });
    documentId = created._id;
  } catch (error) {
    console.error("Saving custom request failed", error);
    return { ok: false, problems: ["Something went wrong sending your request. Please try again in a moment."] };
  }

  const rows: [string, string][] = [
    ["Set", setTypes.find((t) => t.id === draft.setType)?.title ?? "—"],
    ...(designName ? [["Design", designName] as [string, string]] : []),
    ...(draft.vision.trim() ? [["Vision", draft.vision.trim()] as [string, string]] : []),
    ["Shape", shape ?? "—"],
    ["Length", draft.length ?? "—"],
    ...(colour && draft.setType !== "existing" ? [["Base colour", colour] as [string, string]] : []),
    ["Sizes", sizes],
    ["Matching toes", draft.toes ? "Yes" : "No"],
    ...(deadline ? [["Needed by", deadline] as [string, string]] : []),
    ["Ship to", draft.country],
  ];

  // The request is saved; emails go out after the response so the customer isn't kept waiting
  after(() => sendRequestEmails({ reference, documentId, name, email, rows, photoCount: photos.length }));

  return { ok: true, reference };
}
