"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { BrowseItem } from "@/lib/browse/items";

const HOLD_MS = 5000;
/** Dense grid so neighbors always fill top/left when a card is centered. */
const COLS = 5;
const ROWS = 5;
const CARD_W = 300;
const CARD_H = 268;
/** Wide enough that CARD_SCALE_ACTIVE still leaves a clear gutter. */
const GAP = 44;
const PAD = 40;

/** Hold zoomed in so the spotlight reads larger; out pulls back to pan. */
const SCALE_HOLD = 1.26;
const SCALE_OUT = 0.9;
/** Mobile: pull back so neighbors read as a canvas, not one huge card. */
const SCALE_HOLD_MOBILE = 0.58;
const SCALE_OUT_MOBILE = 0.48;
const CARD_SCALE_ACTIVE = 1.05;
const MOBILE_MQ = "(max-width: 767px)";

function holdScale(mobile: boolean) {
  return mobile ? SCALE_HOLD_MOBILE : SCALE_HOLD;
}
function outScale(mobile: boolean) {
  return mobile ? SCALE_OUT_MOBILE : SCALE_OUT;
}

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

/** Figma Mask group SVG — soft radial, center α 0.5 → edge 0 (desktop). */
const FIELD_MASK = "url(/landing/hero-canvas-mask.svg)";
/** Mobile: taller band, soft radial — more cards visible without covering copy. */
const FIELD_MASK_MOBILE =
  "radial-gradient(ellipse 95% 85% at 50% 38%, rgba(217,217,217,1) 0%, rgba(115,115,115,0) 78%)";

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
        "absolute flex flex-col gap-1.5 overflow-hidden rounded-[12px] p-1.5",
        active && "z-20",
      )}
      style={{
        left,
        top,
        width: CARD_W,
        height: CARD_H,
        background: glassBg,
        border: active
          ? "1px solid rgba(255,255,255,0.55)"
          : "1px solid rgba(255,255,255,0.14)",
        boxShadow: active ? spotlightShadow : "none",
        backdropFilter: active ? "blur(28px) saturate(1.7)" : "blur(10px) saturate(1.2)",
        WebkitBackdropFilter: active ? "blur(28px) saturate(1.7)" : "blur(10px) saturate(1.2)",
      }}
      animate={
        reducedMotion
          ? { opacity: 1, scale: 1 }
          : {
              // Field cards stay at 1 — Figma mask (α≤0.5) softens them; spotlight is unmasked.
              opacity: 1,
              scale: active ? CARD_SCALE_ACTIVE : 1,
            }
      }
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 28, mass: 0.85 }
      }
    >
      {/* Glass refraction: top specular + edge rim (Figma bento) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[12px]"
        style={{
          boxShadow: active
            ? "inset 0 1.5px 0 rgba(255,255,255,0.78), inset 0 -1px 0 rgba(255,255,255,0.1), inset 1.5px 0 0 rgba(255,255,255,0.22), inset -1px 0 0 rgba(255,255,255,0.1)"
            : "inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42%] rounded-t-[12px]"
        style={{
          background: active
            ? "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 42%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 70%)",
          mixBlendMode: "soft-light",
        }}
      />

      <div className="relative z-[1] shrink-0 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[13px] text-white sm:text-[14px]">
        {item.title}
      </div>
      {/* Figma media radius 10 inside card 12; radius on media too — video ignores parent clip otherwise */}
      <div className="relative z-[1] min-h-0 flex-1 overflow-clip rounded-[10px] bg-white/90 [transform:translateZ(0)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- CDN posters; sized by aspect box. */}
        <img
          src={item.poster}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 size-full rounded-[10px] object-cover"
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
            className="absolute inset-0 size-full rounded-[10px] object-cover"
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
  /** First layout pass done — avoid animating from 800×900 guess into real size. */
  const [ready, setReady] = React.useState(false);
  const [view, setView] = React.useState({ w: 800, h: 900 });
  const [camera, setCamera] = React.useState<Camera>(() =>
    cameraFor(startIndex, 800, 900, SCALE_HOLD),
  );
  const [transition, setTransition] = React.useState({
    duration: 0,
    ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
  });
  const spotlightRef = React.useRef(startIndex);
  const viewRef = React.useRef(view);
  const scaleRef = React.useRef(SCALE_HOLD);
  const holdRef = React.useRef(SCALE_HOLD);
  const outRef = React.useRef(SCALE_OUT);

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

    const mq = window.matchMedia(MOBILE_MQ);
    const syncBreakpoint = () => {
      const mobile = mq.matches;
      holdRef.current = holdScale(mobile);
      outRef.current = outScale(mobile);
    };
    syncBreakpoint();

    const apply = (w: number, h: number, first: boolean) => {
      if (w < 1 || h < 1) return;
      syncBreakpoint();
      setView({ w, h });
      // Resize / first paint: snap camera, never ease into place.
      setTransition({ duration: 0, ease: [0, 0, 1, 1] });
      const scale = first || scaleRef.current === SCALE_HOLD || scaleRef.current === SCALE_HOLD_MOBILE
        ? holdRef.current
        : scaleRef.current;
      setCamera(cameraFor(spotlightRef.current, w, h, scale));
      if (first) setReady(true);
    };

    apply(el.clientWidth, el.clientHeight, true);
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      apply(width, height, false);
    });
    const onMq = () => apply(el.clientWidth, el.clientHeight, false);
    ro.observe(el);
    mq.addEventListener("change", onMq);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  React.useEffect(() => {
    if (!ready || cards.length <= 1 || reducedMotion) return;

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
      const out = outRef.current;
      const hold = holdRef.current;

      setTransition({ duration: OUT_MS / 1000, ease: [0.4, 0, 1, 1] });
      setCamera(cameraFor(current, w, h, out));
      await wait(OUT_MS);
      if (cancelled) return;

      setTransition({ duration: MOVE_MS / 1000, ease: [0.45, 0, 0.55, 1] });
      setSpotlight(next);
      setCamera(cameraFor(next, w, h, out));
      await wait(MOVE_MS);
      if (cancelled) return;

      setTransition({ duration: IN_MS / 1000, ease: [0.32, 0.72, 0, 1] });
      setCamera(cameraFor(next, w, h, hold));
      await wait(IN_MS);
      if (cancelled) return;

      timer = window.setTimeout(() => {
        void cycle();
      }, HOLD_MS);
    };

    // Hold the initial zoomed selection, then start the cycle.
    timer = window.setTimeout(() => {
      void cycle();
    }, HOLD_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, cards.length, reducedMotion]);

  React.useEffect(() => {
    if (!ready || !reducedMotion || cards.length <= 1) return;
    const id = window.setInterval(() => {
      setSpotlight((current) => {
        const next = nextSpotlightIndex(current, cards.length);
        const { w, h } = viewRef.current;
        setTransition({ duration: 0, ease: [0, 0, 1, 1] });
        setCamera(cameraFor(next, w, h, holdRef.current));
        return next;
      });
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [ready, cards.length, reducedMotion]);

  if (cards.length === 0) return null;

  const active = cards[spotlight];
  const activeRect = cardRect(spotlight);
  const cameraMotion = {
    x: camera.x,
    y: camera.y,
    scale: camera.scale,
  };
  const cameraTransition = reducedMotion ? { duration: 0 } : transition;
  const stageStyle = {
    width: canvasW,
    height: canvasH,
    transformOrigin: "0px 0px" as const,
    visibility: (ready ? "visible" : "hidden") as "visible" | "hidden",
  };

  return (
    <div
      ref={viewportRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] min-h-[260px] overflow-hidden md:inset-y-0 md:right-0 md:left-auto md:h-auto md:min-h-0 md:w-[58%]"
      aria-hidden
    >
      {/* Soft top wash — eases the copy ↔ canvas seam on mobile */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[rgba(7,26,49,0.45)] via-[rgba(7,26,49,0.18)] to-transparent md:hidden"
      />
      {/* Soft field — mobile: bottom-band radial; md+: Figma mask SVG */}
      <div
        className="absolute inset-0 max-md:[mask-image:var(--hero-field-mask-mobile)] max-md:[-webkit-mask-image:var(--hero-field-mask-mobile)] md:[mask-image:var(--hero-field-mask)] md:[-webkit-mask-image:var(--hero-field-mask)]"
        style={
          {
            "--hero-field-mask": FIELD_MASK,
            "--hero-field-mask-mobile": FIELD_MASK_MOBILE,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          } as React.CSSProperties
        }
      >
        <motion.div
          className="absolute top-0 left-0 transform-gpu will-change-transform"
          style={stageStyle}
          animate={cameraMotion}
          transition={cameraTransition}
        >
          {cards.map((item, index) => {
            if (index === spotlight) return null;
            const rect = cardRect(index);
            return (
              <HeroCard
                key={item.key}
                item={item}
                active={false}
                allowVideo={false}
                reducedMotion={reducedMotion}
                left={rect.left}
                top={rect.top}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Clear spotlight — Figma 1:598 sits outside the mask so hero-bg never washes it. */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 transform-gpu will-change-transform"
          style={stageStyle}
          animate={cameraMotion}
          transition={cameraTransition}
        >
          {active ? (
            <HeroCard
              key={`spotlight-${active.key}`}
              item={active}
              active
              allowVideo={videosReady}
              reducedMotion={reducedMotion}
              left={activeRect.left}
              top={activeRect.top}
            />
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
