import type { IconNode } from "lucide";

/**
 * Filled Lucide-style nodes for MorphIcon. Stroke Play/Pause look hollow in the
 * dock; these use solid geometry so the morph still reads as play ↔ pause.
 */
export const SolidPlay = [
  [
    "path",
    {
      d: "M6.3 3.1A1.5 1.5 0 0 0 4 4.4v15.2a1.5 1.5 0 0 0 2.3 1.3l12.4-7.6a1.5 1.5 0 0 0 0-2.6L6.3 3.1z",
      fill: "currentColor",
      stroke: "none",
    },
  ],
] as unknown as IconNode;

export const SolidPause = [
  [
    "rect",
    {
      x: "5",
      y: "3",
      width: "5",
      height: "18",
      rx: "1.2",
      fill: "currentColor",
      stroke: "none",
    },
  ],
  [
    "rect",
    {
      x: "14",
      y: "3",
      width: "5",
      height: "18",
      rx: "1.2",
      fill: "currentColor",
      stroke: "none",
    },
  ],
] as unknown as IconNode;
