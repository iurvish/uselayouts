/**
 * Canvas progressive media:
 * green = viewport + predict ring (video playing),
 * yellow = farther overscan (poster only),
 * red = unmounted.
 */
export function canvasMediaTier(
  x: number,
  y: number,
  cardW: number,
  height: number,
  viewW: number,
  viewH: number,
  imageOverscan: number,
  videoPredict = 0,
): "video" | "image" | null {
  if (x + cardW < -imageOverscan || x > viewW + imageOverscan) return null;
  if (y + height < -imageOverscan || y > viewH + imageOverscan) return null;
  const inPredict =
    x + cardW > -videoPredict &&
    x < viewW + videoPredict &&
    y + height > -videoPredict &&
    y < viewH + videoPredict;
  return inPredict ? "video" : "image";
}

export function canvasAllowVideo(media: "video" | "image") {
  return media === "video";
}

/**
 * During pan: keep already-playing clips mounted, and start anything that
 * has entered the predict ring so it is live before it hits the viewport.
 */
export function canvasMediaWhilePanning(
  want: "video" | "image",
  previous?: "video" | "image",
): "video" | "image" {
  if (want === "video" || previous === "video") return "video";
  return "image";
}
