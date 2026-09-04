import {
  DEFAULT_PREVIEW_BACKGROUNDS,
  parsePreviewBackgrounds,
  resolvePreviewBackground,
} from "@/lib/open/preview-background";

const RAW: Record<string, unknown> = {
  "3d-book": { light: "#bc2929", dark: "#bc2929" },
  "accessible-action": "#212121",
  accordionos: "#f1f2f5",
  "card-folder": "#faf8f6",
  "corner-vidoe": "#f3f0fa",
  "elevate-testimonial": "#f8f8f6",
  "focus-testimonials": "#e6e9eb",
  "infinite-grid": "#fcfcfc",
  "polaroid-drag": "#f6f4f6",
  "pop-tilt-cards": "#1c1c1c",
  rollingcardstack: "#e5e5e0",
  urvish: { light: "#ffffff", dark: "#FFFFFF" },
  "wheel-carousel": "#ffffff",
};

export function browsePreviewBackground(slug: string) {
  return resolvePreviewBackground(parsePreviewBackgrounds(RAW[slug]), "dark");
}

export const DEFAULT_BROWSE_PREVIEW_BACKGROUND = DEFAULT_PREVIEW_BACKGROUNDS.dark;
