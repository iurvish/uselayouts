"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { BrowseItem } from "@/lib/browse/items";

const HOLD_MS = 5000;
/** Dense grid so neighbors always fill top/left when a card is centered. */
const COLS = 5;
const ROWS = 5;
const CARD_W = 320;
const CARD_H = 286;
const GAP = 20;
const PAD = 40;

/** Hold zoomed in so the spotlight reads larger; out pulls back to pan. */
const SCALE_HOLD = 1.38;
const SCALE_OUT = 0.92;
const CARD_SCALE_ACTIVE = 1.1;

const OUT_MS = 220;
const MOVE_MS = 380;
const IN_MS = 280;

/** Figma glass card elevation (near layers first). */
const spotlightShadow = [
  "0 9px 20px rgba(0,0,0,0.10)",
  "0 37px 37px rgba(0,0,0,0.09)",
  "0 84px 50px rgba(0,0,0,0.05)",
  "0 149px 60px rgba(0,0,0,0.01)",
  "0 233px 65px rgba(0,0,0,0)",
].join(", ");

const glassBg = "rgba(255, 255, 255, 0.20)";

const canvasW = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP;
const canvasH = PAD * 2 + ROWS * CARD_H + (ROWS - 1) * GAP;
const TOTAL = COLS * ROWS;

type Camera = { x: number; y: number; scale: number };
type DeckCard = BrowseItem & { key: string };

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

function isInterior(index: number) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return col > 0 && col < COLS - 1 && row > 0 && row < ROWS - 1;
}

/** Tile/dupe source items to fill the dense grid (keys unique for React). */
function buildDeck(items: BrowseItem[]): DeckCard[] {
  if (items.length === 0) return [];
  return Array.from({ length: TOTAL }, (_, i) => {
    const item = items[i % items.length]!;
    return { ...item, key: `${item.slug}-${i}` };
  });
}

/** Prefer a distant interior card so the frame stays filled on all sides. */
function nextSpotlightIndex(current: number, count: number) {
  if (count <= 1) return 0;
  const curCol = current % COLS;
  const curRow = Math.floor(current / COLS);
  const ranked = Array.from({ length: count }, (_, i) => i)
    .filter((i) => i !== current && isInterior(i))
    .map((i) => {
      const dist = Math.abs((i % COLS) - curCol) + Math.abs(Math.floor(i / COLS) - curRow);
      return { i, dist };
    })
    .sort((a, b) => b.dist - a.dist);

  const pool = ranked.length ? ranked : Array.from({ length: count }, (_, i) => ({ i, dist: 1 })).filter((r) => r.i !== current);
  const far = pool.filter((r) => r.dist >= 2);
  const pick = far.length ? far : pool;
  return pick[Math.floor(Math.random() * Math.min(4, pick.length))]!.i;
}

function firstInteriorIndex() {
  for (let i = 0; i < TOTAL; i++) if (isInterior(i)) return i;
  return 0;
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
        "absolute flex flex-col gap-1.5 rounded-[12px] p-1.5",
        active && "z-20",
      )}
      style={{
        left,
        top,
        width: CARD_W,
        height: CARD_H,
        background: glassBg,
        border: active
          ? "1px solid rgba(255,255,255,0.42)"
          : "1px solid rgba(255,255,255,0.14)",
        boxShadow: active ? spotlightShadow : "none",
        backdropFilter: active ? "blur(22px) saturate(1.55)" : "blur(10px) saturate(1.2)",
        WebkitBackdropFilter: active ? "blur(22px) saturate(1.55)" : "blur(10px) saturate(1.2)",
      }}
      animate={
        reducedMotion
          ? { opacity: active ? 1 : 0.4, scale: 1 }
          : {
              opacity: active ? 1 : 0.36,
              scale: active ? CARD_SCALE_ACTIVE : 1,
            }
      }
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 28, mass: 0.85 }
      }
    >
      {/* Specular / refraction rim — Figma glass highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]"
        style={{
          boxShadow: active
            ? "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.08), inset 1px 0 0 rgba(255,255,255,0.12)"
            : "inset 0 1px 0 rgba(255,255,255,0.22)",
          background: active
            ? "linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 38%, transparent 62%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%)",
        }}
      />

      <div className="relative z-[1] shrink-0 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[13px] text-white sm:text-[14px]">
        {item.title}
      </div>
      <div className="relative z-[1] min-h-0 flex-1 overflow-hidden rounded-[6px] bg-white/90">
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
  const cards = React.useMemo(() => buildDeck(items.slice(0, 12)), [items]);
  const reducedMotion = useReducedMotion() ?? false;
  const startIndex = firstInteriorIndex();
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = React.useState(startIndex);
  const [videosReady, setVideosReady] = React.useState(false);
  const [view, setView] = React.useState({ w: 800, h: 900 });
  const [camera, setCamera] = React.useState<Camera>(() =>
    cameraFor(startIndex, 800, 900, SCALE_HOLD),
  );
  const [transition, setTransition] = React.useState({
    duration: 0.45,
    ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
  });
  const spotlightRef = React.useRef(startIndex);
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

      setTransition({ duration: OUT_MS / 1000, ease: [0.4, 0, 1, 1] });
      setCamera(cameraFor(current, w, h, SCALE_OUT));
      await wait(OUT_MS);
      if (cancelled) return;

      setTransition({ duration: MOVE_MS / 1000, ease: [0.45, 0, 0.55, 1] });
      setSpotlight(next);
      setCamera(cameraFor(next, w, h, SCALE_OUT));
      await wait(MOVE_MS);
      if (cancelled) return;

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
            "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%), linear-gradient(180deg, transparent 0%, black 4%, black 96%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%), linear-gradient(180deg, transparent 0%, black 4%, black 96%, transparent 100%)",
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
                key={item.key}
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
