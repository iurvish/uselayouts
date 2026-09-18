/**
 * Keeps only the most relevant previews decoding at once. Callers should only
 * register tiles that are actually on-screen; the pool then plays the top slice
 * and pauses the rest so a dense canvas doesn't melt the GPU.
 */

type NavHint = {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const candidates = new Map<HTMLVideoElement, number>();
let frame = 0;
let watching = false;

export function maxConcurrentVideos(nav?: NavHint | null) {
  if (!nav) return 4;
  if (nav.connection?.saveData) return 1;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  // Hardware decoders are scarce; compositor cost is ~linear in playing count.
  // Predict ring needs spare slots so clips are already running when they enter.
  if (cores <= 4 || memory <= 4) return 4;
  if (cores <= 8) return 8;
  return 10;
}

function maxConcurrent() {
  if (typeof navigator === "undefined") return 4;
  return maxConcurrentVideos(navigator as NavHint);
}

function ensureWatch() {
  if (watching || typeof document === "undefined") return;
  watching = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      for (const [video] of candidates) video.pause();
      return;
    }
    schedule();
  });
}

function reconcile() {
  frame = 0;
  if (typeof document !== "undefined" && document.hidden) return;
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
  ensureWatch();
  const prev = candidates.get(video);
  if (prev === priority && !video.paused) return;
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

/** Higher when closer to the viewport center. `pad` is the predict ring. */
export function priorityFromCenter(
  tileCenterX: number,
  tileCenterY: number,
  viewW: number,
  viewH: number,
  pad = 0,
) {
  const dx = tileCenterX - viewW / 2;
  const dy = tileCenterY - viewH / 2;
  const dist = Math.hypot(dx, dy);
  const maxDist = Math.hypot(viewW / 2 + pad, viewH / 2 + pad) || 1;
  return PRIORITY_VISIBLE + Math.round((1 - Math.min(dist / maxDist, 1)) * 900);
}
