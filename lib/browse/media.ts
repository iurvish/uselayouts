import { browseItems } from "@/lib/browse/items";

export const MEDIA_HEIGHTS = [220, 320, 180, 280, 380, 200, 300, 260];

/** Figma 82:3892 — title bar (10+16+10) + chrome bottom pad (5). */
export const BROWSE_CHROME_EXTRA = 41;

/** Figma 91:4677 — switcher row thumb (~60×39). */
export const SWITCHER_THUMB = { w: 60, h: 39 } as const;

export function mediaHeight(index: number) {
  return MEDIA_HEIGHTS[index % MEDIA_HEIGHTS.length];
}

/** Height of the media box at `cardW` given poster width/height. */
export function posterMediaHeight(
  cardW: number,
  aspect: number | undefined,
  index: number,
) {
  if (aspect && Number.isFinite(aspect) && aspect > 0) {
    return Math.round(cardW / aspect);
  }
  return mediaHeight(index);
}

export function tileHeight(index: number) {
  return mediaHeight(index) + BROWSE_CHROME_EXTRA;
}

export function tileHeightFor(
  cardW: number,
  aspect: number | undefined,
  index: number,
) {
  return posterMediaHeight(cardW, aspect, index) + BROWSE_CHROME_EXTRA;
}

export function browsePoster(slug: string) {
  return browseItems.find((item) => item.slug === slug)?.poster;
}
