"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { BrowseItem } from "@/lib/browse/items";

const HOLD_MS = 5000;
const COLS = 3;
const CARD_W = 340;
const CARD_H = 300;
const GAP = 28;
const PAD = 80;

/** Zoomed-in focus vs pulled-back overview (canvas transform, not per-card scale). */
const SCALE_HOLD = 0.9;
const SCALE_OUT = 0.68;

const OUT_MS = 220;
const MOVE_MS = 380;
const IN_MS = 280;

/** Figma 1:598 selected card shadow — crisp near layers, soft far layers. */
const spotlightShadow =
  "0 9px 10px rgba(0,0,0,0.1), 0 37px 18.5px rgba(0,0,0,0.09), 0 84px 25px rgba(0,0,0,0.05), 0 149px 30px rgba(0,0,0,0.01)";

const canvasW = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP;
const canvasH = PAD * 2 + Math.ceil(12 / COLS) * CARD_H + (Math.ceil(12 / COLS) - 1) * GAP;

type Camera = { x: number; y: number; scale: number };

function cardRect(index: number) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return {
    left: PAD + col * (CARD_W + GAP),
    top: PAD + row * (CARD_H + GAP),
    width: CARD_W,
    height: CARD_H,
  };
}

/** transform-origin 0 0: screen = canvas * scale + translate. */
function cameraFor(index: number, viewW: number, viewH: number, scale: number): Camera {
  const rect = cardRect(index);
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return {
    x: viewW / 2 - cx * scale,
    y: viewH / 2 - cy * scale,
    scale,
  };
}

/** Prefer a card far from the current one (Manhattan distance on the 3-col grid). */
function nextSpotlightIndex(current: number, count: number) {
  if (count <= 1) return 0;
  const curCol = current % COLS;
  const curRow = Math.floor(current / COLS);
  const ranked = Array.from({ length: count }, (_, i) => i)
    .filter((i) => i !== current)
    .map((i) => {
      const dist = Math.abs((i % COLS) - curCol) + Math.abs(Math.floor(i / COLS) - curRow);
      return { i, dist };
    })
    .sort((a, b) => b.dist - a.dist);

  const far = ranked.filter((r) => r.dist >= 2);
  const pool = far.length ? far : ranked;
  return pool[Math.floor(Math.random() * Math.min(3, pool.length))]!.i;
}

function deferUntilIdle(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  let idleId = 0;
  let timeoutId = 0;
  const run = () => cb();

  const afterLoad = () => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(run, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(run, 1400);
    }
  };

  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });

  return () => {
    window.removeEventListener("load", afterLoad);
    const w = window as Window & { cancelIdleCallback?: (id: number) => void };
    if (idleId && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}

function HeroCard({
  item,
  active,
  allowVideo,
  reducedMotion,
  left,
  top,
}: {
  item: BrowseItem;
  active: boolean;
  allowVideo: boolean;
  reducedMotion: boolean;
  left: number;
  top: number;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mountVideo = allowVideo && active && Boolean(item.video);

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node || !mountVideo) return;
    void node.play().catch(() => {});
    return () => {
      node.pause();
    };
  }, [mountVideo]);

  return (
    <motion.figure
      className={cn(
        "absolute flex flex-col gap-1.5 overflow-hidden rounded-xl border border-white/10 bg-white/20 p-1.5",
        active && "z-10",
      )}
      style={{
        left,
        top,
        width: CARD_W,
        height: CARD_H,
        boxShadow: active ? spotlightShadow : "none",
      }}
      animate={
        reducedMotion
          ? { opacity: active ? 1 : 0.45 }
          : { opacity: active ? 1 : 0.42 }
      }
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
      }
    >
      <div className="shrink-0 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[13px] text-white/90 sm:text-[14px]">
        {item.title}
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[10px] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- CDN posters; sized by aspect box. */}
        <img
          src={item.poster}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
          draggable={false}
        />
        {mountVideo ? (
          <video
            ref={videoRef}
            src={item.video}
            poster={item.poster}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full object-cover"
            draggable={false}
          />
        ) : null}
      </div>
    </motion.figure>
  );
}

export function HeroSpotlightCanvas({ items }: { items: BrowseItem[] }) {
  const cards = items.slice(0, 12);
  const reducedMotion = useReducedMotion() ?? false;
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = React.useState(0);
  const [videosReady, setVideosReady] = React.useState(false);
  const [view, setView] = React.useState({ w: 800, h: 900 });
  const [camera, setCamera] = React.useState<Camera>(() =>
    cameraFor(0, 800, 900, SCALE_HOLD),
  );
  const [transition, setTransition] = React.useState({
    duration: 0.45,
    ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
  });
  const spotlightRef = React.useRef(0);
  const viewRef = React.useRef(view);
  const scaleRef = React.useRef(SCALE_HOLD);

  React.useEffect(() => {
    spotlightRef.current = spotlight;
  }, [spotlight]);

  React.useEffect(() => {
    viewRef.current = view;
  }, [view]);

  React.useEffect(() => {
    scaleRef.current = camera.scale;
  }, [camera.scale]);

  React.useEffect(() => deferUntilIdle(() => setVideosReady(true)), []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const apply = (w: number, h: number) => {
      if (w < 1 || h < 1) return;
      setView({ w, h });
      // Keep current zoom level — don't snap hold mid zoom-out/move.
      setCamera(cameraFor(spotlightRef.current, w, h, scaleRef.current));
    };

    apply(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      apply(width, height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    if (cards.length <= 1 || reducedMotion) return;

    let cancelled = false;
    let timer = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const cycle = async () => {
      const { w, h } = viewRef.current;
      const current = spotlightRef.current;
      const next = nextSpotlightIndex(current, cards.length);

      // 1) Zoom out on current card
      setTransition({ duration: OUT_MS / 1000, ease: [0.4, 0, 1, 1] });
      setCamera(cameraFor(current, w, h, SCALE_OUT));
      await wait(OUT_MS);
      if (cancelled) return;

      // 2) Pan to next while still zoomed out
      setTransition({ duration: MOVE_MS / 1000, ease: [0.45, 0, 0.55, 1] });
      setSpotlight(next);
      setCamera(cameraFor(next, w, h, SCALE_OUT));
      await wait(MOVE_MS);
      if (cancelled) return;

      // 3) Zoom in on next card
      setTransition({ duration: IN_MS / 1000, ease: [0.32, 0.72, 0, 1] });
      setCamera(cameraFor(next, w, h, SCALE_HOLD));
      await wait(IN_MS);
      if (cancelled) return;

      timer = window.setTimeout(() => {
        void cycle();
      }, HOLD_MS);
    };

    timer = window.setTimeout(() => {
      void cycle();
    }, HOLD_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cards.length, reducedMotion]);

  // Reduced motion: jump camera + spotlight, no zoom choreography.
  React.useEffect(() => {
    if (!reducedMotion || cards.length <= 1) return;
    const id = window.setInterval(() => {
      setSpotlight((current) => {
        const next = nextSpotlightIndex(current, cards.length);
        const { w, h } = viewRef.current;
        setTransition({ duration: 0, ease: [0, 0, 1, 1] });
        setCamera(cameraFor(next, w, h, SCALE_HOLD));
        return next;
      });
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [cards.length, reducedMotion]);

  if (cards.length === 0) return null;

  return (
    <div
      ref={viewportRef}
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] overflow-hidden md:block"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(180deg, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(180deg, transparent 0%, black 6%, black 94%, transparent 100%)",
          maskComposite: "intersect",
        }}
      >
        <motion.div
          className="absolute top-0 left-0 transform-gpu will-change-transform"
          style={{
            width: canvasW,
            height: canvasH,
            transformOrigin: "0px 0px",
          }}
          animate={{
            x: camera.x,
            y: camera.y,
            scale: camera.scale,
          }}
          transition={reducedMotion ? { duration: 0 } : transition}
        >
          {cards.map((item, index) => {
            const rect = cardRect(index);
            return (
              <HeroCard
                key={item.slug}
                item={item}
                active={index === spotlight}
                allowVideo={videosReady}
                reducedMotion={reducedMotion}
                left={rect.left}
                top={rect.top}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
