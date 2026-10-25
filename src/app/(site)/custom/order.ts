import type { NailLength, NailShape } from "@/content/catalog";
import type { SetType } from "@/content/order-options";
import { nearestTip, presetMillimetres, presetSizes, type PresetSize } from "@/content/sizing";

// Shared by the form (client) and the submit action (server).

export type Hand = [string, string, string, string, string];

export type OrderDraft = {
  setType: SetType | null;
  existingDesign: string | null;
  vision: string;
  shape: NailShape | "artist" | null;
  length: NailLength | null;
  baseColour: string | null;
  sizeMode: "preset" | "measured" | "kit" | null;
  presetSize: PresetSize | null;
  sizes: { left: Hand; right: Hand };
  toes: boolean | null;
  deadline: string;
  country: string;
  name: string;
  email: string;
  instagram: string;
  referral: string;
  agreed: boolean;
};

/** An inspiration photo already uploaded to Sanity, plus the artist credit the customer gave */
export type InspirationUpload = { assetId: string; credit: string };

export const emptyDraft: OrderDraft = {
  setType: null,
  existingDesign: null,
  vision: "",
  shape: null,
  length: null,
  baseColour: null,
  sizeMode: null,
  presetSize: null,
  sizes: { left: ["", "", "", "", ""], right: ["", "", "", "", ""] },
  toes: null,
  deadline: "",
  country: "",
  name: "",
  email: "",
  instagram: "",
  referral: "",
  agreed: false,
};

export const isValidSize = (value: string) => {
  const mm = Number(value.replace(",", "."));
  return value.trim() !== "" && mm >= 5 && mm <= 25;
};

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function sizesComplete(draft: OrderDraft) {
  switch (draft.sizeMode) {
    case "kit":
      return true;
    case "preset":
      return draft.presetSize !== null && draft.presetSize in presetSizes;
    case "measured":
      return [...draft.sizes.left, ...draft.sizes.right].every(isValidSize);
    default:
      return false;
  }
}

/** Returns a list of problems; empty means the order can be sent. */
export function validateOrder(draft: OrderDraft, inspirationCount: number, shippingCountries: string[]): string[] {
  const problems: string[] = [];
  if (!draft.setType) problems.push("Choose what kind of set you'd like.");
  if (draft.setType === "existing" && !draft.existingDesign) problems.push("Pick the design you'd like remade.");
  if ((draft.setType === "own-idea" || draft.setType === "inspired") && !draft.vision.trim() && inspirationCount === 0)
    problems.push("Tell me about your idea or add some inspiration photos.");
  if (!draft.shape) problems.push("Choose a shape.");
  if (!draft.length) problems.push("Choose a length.");
  if (draft.setType !== "existing" && !draft.baseColour) problems.push("Choose a base colour.");
  if (!sizesComplete(draft)) problems.push("Choose a size, add your measurements or ask for a sizing kit.");
  if (draft.toes === null) problems.push("Let me know if you'd like matching toes.");
  if (!shippingCountries.includes(draft.country)) problems.push("Choose where to ship.");
  if (!draft.name.trim()) problems.push("Add your name.");
  if (!isValidEmail(draft.email)) problems.push("Add a valid email address.");
  if (!draft.agreed) problems.push("Please accept the order terms.");
  return problems;
}

const toMm = (value: string) => Number(value.replace(",", "."));

/** Human-readable sizes for the Studio, including her tip numbers */
export function describeSizes(draft: OrderDraft): string {
  if (draft.sizeMode === "kit") return "Sizing kit requested";
  if (draft.sizeMode === "preset" && draft.presetSize) {
    return `Standard ${draft.presetSize}: ${presetMillimetres(draft.presetSize).join("/")} mm (tips #${presetSizes[draft.presetSize].join("/")})`;
  }
  const hand = (label: string, sizes: Hand) =>
    `${label}: ${sizes.map(toMm).join("/")} mm (tips #${sizes.map((s) => nearestTip(toMm(s))).join("/")})`;
  return `${hand("Left", draft.sizes.left)}\n${hand("Right", draft.sizes.right)}`;
}
