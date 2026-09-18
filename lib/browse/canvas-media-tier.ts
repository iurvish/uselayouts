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

/** Pan/coast: keep in-view videos mounted; overscan stays poster-only. */
export function canvasAllowVideo(media: "video" | "image") {
  return media === "video";
}

/**
 * During pan: on-screen tiles stay video (keep playing). Already-mounted
 * videos stay mounted so they don't flash a poster if they clip the edge.
 */
export function canvasMediaWhilePanning(
  want: "video" | "image",
  previous?: "video" | "image",
): "video" | "image" {
  if (want === "video" || previous === "video") return "video";
  return "image";
}
