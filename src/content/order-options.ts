import type { NailLength, NailShape } from "./catalog";

// Fixed choices in the custom order form.

export const setTypes = [
  {
    id: "own-idea",
    title: "I have a precise idea",
    description: "You know exactly what you want — I'll bring it to life.",
  },
  {
    id: "inspired",
    title: "Made from my inspiration",
    description: "Send a moodboard, photos or colours and I'll design around them.",
  },
  {
    id: "artists-choice",
    title: "Artist's choice",
    description: "Give me a vibe and full creative freedom.",
  },
  {
    id: "existing",
    title: "One of your past designs",
    description: "Pick a set from the gallery, made to your sizes.",
  },
] as const;

export type SetType = (typeof setTypes)[number]["id"];

export const shapes: { id: NailShape; name: string; path: string }[] = [
  { id: "almond", name: "Almond", path: "M10 100 L10 50 Q12 14 30 4 Q48 14 50 50 L50 100 Z" },
  { id: "stiletto", name: "Stiletto", path: "M10 100 L12 60 Q18 24 30 2 Q42 24 48 60 L50 100 Z" },
  { id: "coffin", name: "Coffin", path: "M10 100 L18 10 L42 10 L50 100 Z" },
  { id: "square", name: "Square", path: "M10 100 L10 14 Q10 10 14 10 L46 10 Q50 10 50 14 L50 100 Z" },
  { id: "oval", name: "Oval", path: "M10 100 L10 40 Q10 4 30 4 Q50 4 50 40 L50 100 Z" },
  { id: "round", name: "Round", path: "M10 100 L10 38 Q10 14 30 14 Q50 14 50 38 L50 100 Z" },
];

/** A shape as offered in the form; which ones, their order and names come from Site settings */
export type ShapeOption = { id: NailShape; name: string; note: string; path: string };

export const defaultShapes: ShapeOption[] = shapes.map((s) => ({ ...s, note: "" }));

export const lengths: { id: NailLength; name: string; hint: string; height: number }[] = [
  { id: "S", name: "Short", hint: "Just past the fingertip", height: 44 },
  { id: "M", name: "Medium", hint: "Everyday length", height: 58 },
  { id: "L", name: "Long", hint: "A real statement", height: 74 },
  { id: "XL", name: "Extra long", hint: "Go big", height: 92 },
];

// Fallbacks for when Site settings in the Studio is empty. The live lists are edited there.
// Placeholder colours — replace with her actual gel shades.
export const defaultBaseColours = [
  { id: "clear", name: "Clear", hex: "#F4F1F2" },
  { id: "milky", name: "Milky white", hex: "#F7F2EC" },
  { id: "sheer-pink", name: "Sheer pink", hex: "#F6C9D4" },
  { id: "nude", name: "Nude", hex: "#E8C2AE" },
  { id: "peach", name: "Peach", hex: "#F7C6A3" },
  { id: "bubblegum", name: "Bubblegum", hex: "#FFB3D9" },
  { id: "matcha", name: "Matcha", hex: "#C3D588" },
  { id: "lilac", name: "Lilac", hex: "#CDB8E6" },
  { id: "black", name: "Black", hex: "#2A2224" },
];

// Shipping to the rest of the EU is paused while the packaging rules settle.
export const defaultShippingCountries = [
  "Finland",
  "United Kingdom",
  "United States",
  "Saudi Arabia",
  "Other (outside the EU)",
];

export const fingers = ["Thumb", "Index", "Middle", "Ring", "Pinky"] as const;
