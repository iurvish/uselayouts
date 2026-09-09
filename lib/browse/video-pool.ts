/**
 * Keeps only the most relevant previews decoding at once. Callers should only
 * register tiles that are actually on-screen; the pool then plays the top slice
 * and pauses the rest so a dense canvas doesn't melt the GPU.
 */

const candidates = new Map<HTMLVideoElement, number>();
let frame = 0;

function maxConcurrent() {
  if (typeof navigator === "undefined") return 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  // Enough for a typical laptop browse viewport; still capped on weak CPUs.
  if (cores <= 4) return 5;
  if (cores <= 8) return 8;
  return 10;
}

function reconcile() {
  frame = 0;
  const limit = maxConcurrent();
  const ranked = [...candidates.entries()].sort((a, b) => b[1] - a[1]);

  ranked.forEach(([video], index) => {
    if (index < limit) {
      if (video.paused) void video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  });
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(reconcile);
}

export function requestPlayback(video: HTMLVideoElement, priority: number) {
  const prev = candidates.get(video);
  if (prev === priority) return;
  candidates.set(video, priority);
  schedule();
}

export function releasePlayback(video: HTMLVideoElement) {
  if (!candidates.delete(video)) return;
  video.pause();
  schedule();
}

export const PRIORITY_VISIBLE = 100;
export const PRIORITY_HOVER = 1000;

/** Higher when closer to the viewport center (canvas). */
export function priorityFromCenter(
  tileCenterX: number,
  tileCenterY: number,
  viewW: number,
  viewH: number,
) {
  const dx = tileCenterX - viewW / 2;
  const dy = tileCenterY - viewH / 2;
  const dist = Math.hypot(dx, dy);
  const maxDist = Math.hypot(viewW / 2, viewH / 2) || 1;
  return PRIORITY_VISIBLE + Math.round((1 - Math.min(dist / maxDist, 1)) * 900);
}
