/**
 * Keeps only the most relevant previews decoding at once. Dozens of simultaneous
 * <video> elements will stall a low-end GPU, so tiles register their priority
 * (hover beats visibility, visibility beats everything offscreen) and the pool
 * plays the top slice and pauses the rest.
 */

const candidates = new Map<HTMLVideoElement, number>();
let frame = 0;

function maxConcurrent() {
  if (typeof navigator === "undefined") return 6;
  const cores = navigator.hardwareConcurrency ?? 8;
  if (cores <= 4) return 2;
  if (cores <= 8) return 4;
  return 6;
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
  if (candidates.get(video) === priority) return;
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
