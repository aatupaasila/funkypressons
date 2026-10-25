// Her sizing system, from the "Measurements" story on Instagram.
// Tips are numbered 0 (widest) to 9 (narrowest); widths in millimetres.

export const tipWidths = [18, 16, 15, 14, 13, 12, 11, 10, 9, 8] as const;

export type PresetSize = "XS" | "S" | "M" | "L";

/** Tip numbers, thumb to pinky */
export const presetSizes: Record<PresetSize, [number, number, number, number, number]> = {
  XS: [3, 6, 5, 7, 9],
  S: [2, 5, 4, 6, 9],
  M: [1, 5, 4, 6, 8],
  L: [0, 4, 3, 5, 7],
};

export const measureSteps = [
  "Place tape across the widest part of your nail.",
  "Mark it from side to side.",
  "Peel the tape off and measure the width in millimetres.",
];

export const presetMillimetres = (size: PresetSize) => presetSizes[size].map((tip) => tipWidths[tip]);

/** The tip that fits a measured width best (rounding up, since a tip slightly too wide can be filed down) */
export function nearestTip(mm: number) {
  for (let tip = tipWidths.length - 1; tip >= 0; tip--) {
    if (tipWidths[tip] >= mm) return tip;
  }
  return 0;
}
