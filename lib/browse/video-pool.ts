/**
 * Keeps only the most relevant previews decoding at once. Callers should only
 * register tiles that are actually on-screen; the pool then plays the top slice
 * and pauses the rest so a dense canvas doesn't melt the GPU.
 *
 * Phones often report 6–8 cores and omit deviceMemory, so core-count alone
 * treats iOS as a desktop. Touch + saveData are the real budget signal.
 */

type NavHint = {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  maxTouchPoints?: number;
  connection?: { saveData?: boolean };
};

const candidates = new Map<HTMLVideoElement, number>();
let frame = 0;
let watching = false;

export function isConstrainedDevice(
  nav?: NavHint | null,
  win?: { matchMedia: (q: string) => { matches: boolean }; innerWidth: number } | null,
) {
  if (!nav) return false;
  if (nav.connection?.saveData) return true;
  if ((nav.deviceMemory ?? Infinity) <= 4) return true;
  if ((nav.hardwareConcurrency ?? 8) <= 4) return true;
  if (!win) return false;
  if (win.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (win.matchMedia("(pointer: coarse)").matches) return true;
  if ((nav.maxTouchPoints ?? 0) > 0 && win.innerWidth < 900) return true;
  return false;
}

export function maxConcurrentVideos(
  nav?: NavHint | null,
  constrained = false,
) {
  if (!nav) return 4;
  if (nav.connection?.saveData) return 1;
  if (constrained) return 2;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  if (cores <= 4 || memory <= 4) return 2;
  if (cores <= 8) return 6;
  return 8;
}

/** How many <video> nodes may exist. Paused decoders still cost RAM on iOS. */
export function maxMountedVideos(
  nav?: NavHint | null,
  constrained = false,
) {
  if (constrained || nav?.connection?.saveData) return 3;
  return Math.max(maxConcurrentVideos(nav, constrained) + 2, 8);
}

function constrainedNow() {
  if (typeof navigator === "undefined") return false;
  return isConstrainedDevice(
    navigator as NavHint,
    typeof window === "undefined" ? null : window,
  );
}

function maxConcurrent() {
  if (typeof navigator === "undefined") return 4;
  return maxConcurrentVideos(navigator as NavHint, constrainedNow());
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
