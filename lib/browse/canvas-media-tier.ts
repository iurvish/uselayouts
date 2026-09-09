/**
 * Canvas progressive media: green = viewport (video), yellow = overscan (poster),
 * red = outside overscan (unmounted).
 */
export function canvasMediaTier(
  x: number,
  y: number,
  cardW: number,
  height: number,
  viewW: number,
  viewH: number,
  imageOverscan: number,
): "video" | "image" | null {
  if (x + cardW < -imageOverscan || x > viewW + imageOverscan) return null;
  if (y + height < -imageOverscan || y > viewH + imageOverscan) return null;
  const inViewport = x + cardW > 0 && x < viewW && y + height > 0 && y < viewH;
  return inViewport ? "video" : "image";
}
