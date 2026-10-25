import { lengths, setTypes, shapes } from "@/content/order-options";
import { presetSizes, type PresetSize } from "@/content/sizing";
import { emptyDraft, type Hand, type InspirationUpload, type OrderDraft } from "./order";

// The submit action is a public endpoint: anyone can call it with any payload,
// not just our form. Everything is rebuilt here from known values and capped
// lengths before it's validated or stored.

const ASSET_ID = /^image-[a-f0-9]{20,64}-\d{1,5}x\d{1,5}-(jpg|png|webp|gif|heic|heif)$/;

const text = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");
const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | null =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;

function hand(value: unknown): Hand {
  const list = Array.isArray(value) ? value : [];
  return [0, 1, 2, 3, 4].map((i) => text(list[i], 6)) as Hand;
}

export function parseDraft(input: unknown): OrderDraft | null {
  if (typeof input !== "object" || input === null) return null;
  const d = input as Record<string, unknown>;
  const sizes = (typeof d.sizes === "object" && d.sizes !== null ? d.sizes : {}) as Record<string, unknown>;

  return {
    ...emptyDraft,
    setType: oneOf(d.setType, setTypes.map((t) => t.id)),
    existingDesign: typeof d.existingDesign === "string" && /^[a-z0-9-]{1,96}$/.test(d.existingDesign) ? d.existingDesign : null,
    vision: text(d.vision, 4000),
    shape: oneOf(d.shape, [...shapes.map((s) => s.id), "artist" as const]),
    length: oneOf(d.length, lengths.map((l) => l.id)),
    baseColour: typeof d.baseColour === "string" ? d.baseColour.slice(0, 60) : null,
    sizeMode: oneOf(d.sizeMode, ["preset", "measured", "kit"] as const),
    presetSize: oneOf(d.presetSize, Object.keys(presetSizes) as PresetSize[]),
    sizes: { left: hand(sizes.left), right: hand(sizes.right) },
    toes: typeof d.toes === "boolean" ? d.toes : null,
    deadline: text(d.deadline, 10),
    country: text(d.country, 80),
    name: text(d.name, 120),
    email: text(d.email, 200),
    instagram: text(d.instagram, 60),
    referral: text(d.referral, 120),
    agreed: d.agreed === true,
  };
}

export function parseInspiration(input: unknown): InspirationUpload[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 10)
    .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
    .filter((p) => typeof p.assetId === "string" && ASSET_ID.test(p.assetId))
    .map((p) => ({ assetId: p.assetId as string, credit: text(p.credit, 120) }));
}
