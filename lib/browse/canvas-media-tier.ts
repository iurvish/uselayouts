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
 * During pan: keep already-playing clips mounted.
 * `noNewVideo` (phones): never start a new decoder mid-gesture, and drop
 * clips that left the predict ring so video nodes don't accumulate.
 */
export function canvasMediaWhilePanning(
  want: "video" | "image",
  previous?: "video" | "image",
  noNewVideo = false,
): "video" | "image" {
  if (noNewVideo) return previous === "video" && want === "video" ? "video" : "image";
  if (want === "video" || previous === "video") return "video";
  return "image";
}

/** Keep only the highest-priority video tiles; the rest become posters. */
export function capVideoTiles<T extends { media: "video" | "image"; priority: number }>(
  tiles: T[],
  max: number,
): T[] {
  if (max <= 0) return tiles.map((tile) =>
    tile.media === "video" ? { ...tile, media: "image" as const, priority: 0 } : tile,
  );
  const videos = tiles
    .filter((tile) => tile.media === "video")
    .sort((a, b) => b.priority - a.priority);
  if (videos.length <= max) return tiles;
  const keep = new Set(videos.slice(0, max));
  return tiles.map((tile) =>
    tile.media === "video" && !keep.has(tile)
      ? { ...tile, media: "image" as const, priority: 0 }
      : tile,
  );
}
