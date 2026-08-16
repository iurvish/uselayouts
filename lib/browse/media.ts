export const MEDIA_HEIGHTS = [220, 320, 180, 280, 380, 200, 300, 260];

export function mediaHeight(index: number) {
  return MEDIA_HEIGHTS[index % MEDIA_HEIGHTS.length];
}
