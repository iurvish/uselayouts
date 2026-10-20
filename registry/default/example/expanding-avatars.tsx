"use client";

import { cn } from "@/lib/utils";
import type { Transition } from "motion/react";
import { AnimatePresence, MotionConfig, motion, useInView } from "motion/react";
import { Fragment, useCallback, useMemo, useRef, useState, type ReactNode } from "react";

export type ExpandingAvatar = {
  name: string;
  /** Image URL. Leave it out to show initials instead. */
  src?: string;
  /** Line shown in the hover pill. Falls back to `name`. */
  caption?: string;
};

export type AvatarSlot = {
  /** Center, in stage units. */
  x: number;
  y: number;
  /** Diameter, in stage units. */
  size: number;
  /** Entrance delay in seconds. Inner faces leave first. */
  delay: number;
};

export type ExpandingAvatarsProps = {
  avatars?: ExpandingAvatar[];
  badge?: ReactNode;
  heading?: ReactNode;
  /** Accessible name for the list of avatars. */
  label?: string;
  /** Same seed, same scatter. Change it to reshuffle the layout. */
  seed?: number;
  className?: string;
};

/** Layout runs in a fixed 4:3 space, then maps to percentages. */
export const STAGE_WIDTH = 1000;
export const STAGE_HEIGHT = 750;
/** Half-size of the box kept clear for the badge and heading. */
export const CLEAR_HALF_WIDTH = 220;
export const CLEAR_HALF_HEIGHT = 85;

const CLEAR_PAD = 10;
const EDGE_PAD = 6;
/** Neighbours may overlap a little, like a real crowd. */
const MIN_SPACING = 0.8;
const RELAX_PASSES = 80;

type Ring = {
  rx: number;
  ry: number;
  /** Superellipse exponent: 2 is an ellipse, higher squares it off. */
  n: number;
  jitter: number;
  minSize: number;
  maxSize: number;
};

const OUTER_RING: Ring = { rx: 430, ry: 305, n: 3.6, jitter: 0.16, minSize: 60, maxSize: 104 };
const INNER_RING: Ring = { rx: 300, ry: 210, n: 2.2, jitter: 0.08, minSize: 100, maxSize: 124 };

const BLUE_PILL = "bg-[#e7f0ff] text-[#1f5fd1]";

const BURST_SPRING = { type: "spring", stiffness: 140, damping: 17, mass: 0.9 } as const;
const PILL_SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=200&h=200&auto=format&fit=crop&crop=faces&q=80`;
const tapback = (name: string) => `https://tapback.co/api/avatar/${name}.webp`;

const DEFAULT_AVATARS: ExpandingAvatar[] = [
  { name: "Alex", src: unsplash("1500648767791-00dcc994a43e"), caption: "Alex has 2.7K curious minds tuned in" },
  { name: "Sam", src: unsplash("1494790108377-be9c29b29330"), caption: "Sam creates for a circle of 7.0K" },
  { name: "Oliver", src: tapback("Oliver"), caption: "Oliver sketches for 4.3K weekend makers" },
  { name: "Jordan", src: unsplash("1534528741775-53994a69daeb"), caption: "Jordan lands ideas with 9.2K people" },
  { name: "Riley", src: unsplash("1507003211169-0a1dd7228f2d"), caption: "Riley has 3.0K humans catching every post" },
  { name: "Sophie", src: tapback("Sophie"), caption: "Sophie reviews tools for 11K designers" },
  { name: "Casey", src: unsplash("1544005313-94ddf0286df2"), caption: "Casey hosts a 1.8K-strong book club" },
  { name: "Morgan", src: unsplash("1506794778202-cad84cf45f1d"), caption: "Morgan breaks down startups for 6.4K" },
  { name: "Avery", src: unsplash("1517841905240-472988babdf9"), caption: "Avery shares film photos with 5.1K fans" },
  { name: "Rowan", caption: "Rowan just joined. Be one of their first 100" },
  { name: "Noah", src: tapback("Noah"), caption: "Noah streams code to 2.2K night owls" },
  { name: "Quinn", src: unsplash("1539571696357-5a69c17a67c6"), caption: "Quinn talks typography with 3.9K nerds" },
  { name: "Taylor", src: unsplash("1438761681033-6461ffad8d80"), caption: "Taylor cooks for a table of 8.6K" },
  { name: "Emma", src: tapback("Emma"), caption: "Emma writes a letter 14K people open" },
  { name: "Jamie", src: unsplash("1472099645785-5658abf4ff4e"), caption: "Jamie reviews gear for 4.8K creators" },
  { name: "Sasha", src: unsplash("1531123897727-8f129e1688ce"), caption: "Sasha teaches motion to 6.9K students" },
  { name: "Leo", src: tapback("Leo"), caption: "Leo posts daily sketches for 3.3K fans" },
  { name: "Reese", src: unsplash("1463453091185-61582044d556"), caption: "Reese grows plants and 2.1K followers" },
  { name: "Noor", src: unsplash("1487412720507-e7ab37603c6f"), caption: "Noor explains AI to 12K curious minds" },
  { name: "Mia", src: tapback("Mia"), caption: "Mia runs a 5.5K-member style club" },
  { name: "Drew", src: unsplash("1507591064344-4c6ce005b128"), caption: "Drew coaches 3.6K first-time managers" },
  { name: "Jules", src: unsplash("1524504388940-b1c1722653e1"), caption: "Jules travels on a budget with 7.7K" },
  { name: "Kai", caption: "Kai builds in public for 900 early fans" },
  { name: "Ethan", src: tapback("Ethan"), caption: "Ethan shares data tips with 4.0K analysts" },
  { name: "Remy", src: unsplash("1545167622-3a6ac756afa4"), caption: "Remy films street food for 10K" },
  { name: "Eden", src: unsplash("1573496359142-b8d87734a5a2"), caption: "Eden mentors 2.9K career switchers" },
  { name: "Ari", src: unsplash("1552374196-c4e7ffc6e126"), caption: "Ari makes beats for 6.2K listeners" },
  { name: "Harper", src: unsplash("1531746020798-e6953c6e8e04"), caption: "Harper reviews books for 3.2K readers" },
  { name: "Blake", src: unsplash("1522075469751-3a6694fb2f61"), caption: "Blake trains with 2.4K early risers" },
  { name: "Sky", src: unsplash("1534308143481-c55f00be8bd7"), caption: "Sky shoots portraits for 8.1K" },
  { name: "Wren", src: unsplash("1548142813-c348350df52b"), caption: "Wren ships tiny apps to 3.4K" },
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, places = 1) {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

function ringPoint(angle: number, ring: Ring, scale: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const e = 2 / ring.n;
  return {
    x: Math.sign(c) * Math.abs(c) ** e * ring.rx * scale,
    y: Math.sign(s) * Math.abs(s) ** e * ring.ry * scale,
  };
}

/**
 * Maps a fraction of the ring's length (0 to 1) to an angle. Equal angle steps
 * bunch up on a squared-off ring; equal length steps frame it evenly.
 */
function arcSampler(ring: Ring) {
  const steps = 720;
  const lengths = [0];
  let prev = ringPoint(0, ring, 1);
  for (let i = 1; i <= steps; i++) {
    const next = ringPoint((i / steps) * Math.PI * 2, ring, 1);
    lengths.push(lengths[i - 1]! + Math.hypot(next.x - prev.x, next.y - prev.y));
    prev = next;
  }
  const total = lengths[steps]!;
  return (fraction: number) => {
    const target = (((fraction % 1) + 1) % 1) * total;
    let lo = 0;
    let hi = steps;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (lengths[mid]! < target) lo = mid + 1;
      else hi = mid;
    }
    return (lo / steps) * Math.PI * 2;
  };
}

type Bubble = { x: number; y: number; r: number };

/** Push a bubble out of the headline box and back inside the stage. */
function constrain(b: Bubble) {
  const cx = STAGE_WIDTH / 2;
  const cy = STAGE_HEIGHT / 2;
  const left = cx - CLEAR_HALF_WIDTH;
  const right = cx + CLEAR_HALF_WIDTH;
  const top = cy - CLEAR_HALF_HEIGHT;
  const bottom = cy + CLEAR_HALF_HEIGHT;
  const need = b.r + CLEAR_PAD;

  const insideX = b.x > left && b.x < right;
  const insideY = b.y > top && b.y < bottom;
  if (insideX && insideY) {
    // Centre is inside the box: leave by the shortest side.
    const exits = [
      { d: b.x - left, x: left - need, y: b.y },
      { d: right - b.x, x: right + need, y: b.y },
      { d: b.y - top, x: b.x, y: top - need },
      { d: bottom - b.y, x: b.x, y: bottom + need },
    ].sort((p, q) => p.d - q.d);
    b.x = exits[0]!.x;
    b.y = exits[0]!.y;
  } else {
    const nx = clamp(b.x, left, right);
    const ny = clamp(b.y, top, bottom);
    const dx = b.x - nx;
    const dy = b.y - ny;
    const d = Math.hypot(dx, dy);
    if (d < need) {
      b.x = nx + (dx / d) * need;
      b.y = ny + (dy / d) * need;
    }
  }

  b.x = clamp(b.x, b.r + EDGE_PAD, STAGE_WIDTH - b.r - EDGE_PAD);
  b.y = clamp(b.y, b.r + EDGE_PAD, STAGE_HEIGHT - b.r - EDGE_PAD);
}

/**
 * Scatter `count` avatars on two rings around the headline: big faces close
 * in, a looser crowd near the edges. Deterministic for a given seed, so the
 * server and client render the same layout.
 */
export function layoutAvatars(count: number, seed = 7): AvatarSlot[] {
  if (count <= 0) return [];
  const rand = mulberry32(seed);
  const cx = STAGE_WIDTH / 2;
  const cy = STAGE_HEIGHT / 2;

  const inner: number[] = [];
  const outer: number[] = [];
  for (let i = 0; i < count; i++) {
    (count >= 6 && i % 4 === 1 ? inner : outer).push(i);
  }

  const bubbles: Bubble[] = new Array(count);
  const place = (ids: number[], ring: Ring, start: number) => {
    const angleAt = arcSampler(ring);
    ids.forEach((id, k) => {
      const angle = angleAt(start + (k + (rand() - 0.5) * 0.55) / ids.length);
      const scale = 1 + (rand() - 0.6) * ring.jitter;
      const p = ringPoint(angle, ring, scale);
      const size = ring.minSize + rand() ** 1.5 * (ring.maxSize - ring.minSize);
      bubbles[id] = { x: cx + p.x, y: cy + p.y, r: size / 2 };
    });
  };
  place(outer, OUTER_RING, rand());
  place(inner, INNER_RING, rand());

  for (let pass = 0; pass < RELAX_PASSES; pass++) {
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = bubbles[i]!;
        const b = bubbles[j]!;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const min = (a.r + b.r) * MIN_SPACING;
        if (d >= min) continue;
        if (d < 0.001) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const push = (min - d) / 2;
        a.x -= (dx / d) * push;
        a.y -= (dy / d) * push;
        b.x += (dx / d) * push;
        b.y += (dy / d) * push;
      }
    }
    bubbles.forEach(constrain);
  }

  const farthest = Math.hypot(cx, cy);
  return bubbles.map((b) => ({
    x: round(b.x),
    y: round(b.y),
    size: round(b.r * 2),
    delay: round(0.05 + (Math.hypot(b.x - cx, b.y - cy) / farthest) * 0.45 + rand() * 0.12, 3),
  }));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]![0]! : "";
  return (first + last).toUpperCase();
}

const ORIGIN_X = { start: "0%", center: "50%", end: "100%" } as const;

function Caption({
  text,
  below,
  align,
}: {
  text: string;
  below: boolean;
  align: "start" | "center" | "end";
}) {
  const words = text.split(" ");
  const from = below ? -6 : 6;

  return (
    <motion.span
      aria-hidden
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      className={cn(
        // Long captions wrap inside the stage instead of running off it.
        "pointer-events-none absolute z-10 block w-max max-w-[min(18rem,80cqw)] rounded-2xl px-3 py-1.5",
        "text-left text-[12px] leading-[1.3] font-medium sm:text-[13px]",
        "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_20px_-12px_rgba(31,95,209,0.45)]",
        BLUE_PILL,
        below ? "top-[calc(100%+6px)]" : "bottom-[calc(100%+6px)]",
        align === "start" && "left-0",
        align === "end" && "right-0",
        align === "center" && "left-1/2"
      )}
      exit={{ opacity: 0, y: from / 2, scale: 0.98, filter: "blur(2px)", transition: { duration: 0.12 } }}
      initial={{ opacity: 0, y: from, scale: 0.96, filter: "blur(4px)" }}
      style={{
        ...(align === "center" ? { x: "-50%" } : null),
        transformOrigin: `${ORIGIN_X[align]} ${below ? "0%" : "100%"}`,
      }}
      transition={PILL_SPRING}
    >
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          {i > 0 ? " " : null}
          <motion.span
            animate={{ opacity: 1, filter: "blur(0px)" }}
            className="inline-block"
            initial={{ opacity: 0, filter: "blur(3px)" }}
            transition={{ delay: 0.04 + i * 0.025, duration: 0.24, ease: "easeOut" }}
          >
            {word}
          </motion.span>
        </Fragment>
      ))}
    </motion.span>
  );
}

function AvatarBubble({
  avatar,
  slot,
  index,
  active,
  revealed,
  onActivate,
  onDeactivate,
}: {
  avatar: ExpandingAvatar;
  slot: AvatarSlot;
  index: number;
  active: boolean;
  revealed: boolean;
  onActivate: (index: number) => void;
  onDeactivate: (index: number) => void;
}) {
  const [failed, setFailed] = useState(false);
  // An image can fail before hydration, when onError is not attached yet.
  const checkImage = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  const caption = avatar.caption ?? avatar.name;

  // Translate percentages are relative to the bubble itself, so the burst
  // starts at the stage centre at any rendered size.
  const fromX = ((STAGE_WIDTH / 2 - slot.x) / slot.size) * 92;
  const fromY = ((STAGE_HEIGHT / 2 - slot.y) / slot.size) * 92;

  const burst: Transition = {
    x: { ...BURST_SPRING, delay: slot.delay },
    y: { ...BURST_SPRING, delay: slot.delay },
    scale: { type: "spring", stiffness: 180, damping: 15, delay: slot.delay },
    opacity: { duration: 0.35, ease: "easeOut", delay: slot.delay },
    filter: { duration: 0.5, ease: "easeOut", delay: slot.delay },
  };

  // Open the pill toward the middle so it stays on the stage. Faces level with
  // the headline open away from it instead, so the copy is never covered.
  const dy = slot.y - STAGE_HEIGHT / 2;
  const besideHeadline = Math.abs(dy) < CLEAR_HALF_HEIGHT + slot.size / 2 + 40;
  const below = besideHeadline ? dy >= 0 : dy < 0;
  const align =
    slot.x > STAGE_WIDTH * 0.6 ? "end" : slot.x < STAGE_WIDTH * 0.4 ? "start" : "center";

  return (
    <li
      className="absolute aspect-square"
      style={{
        left: `${((slot.x - slot.size / 2) / STAGE_WIDTH) * 100}%`,
        top: `${((slot.y - slot.size / 2) / STAGE_HEIGHT) * 100}%`,
        width: `${(slot.size / STAGE_WIDTH) * 100}%`,
        zIndex: active ? 30 : undefined,
      }}
    >
      <motion.div
        animate={
          revealed
            ? { opacity: 1, x: "0%", y: "0%", scale: 1, filter: "blur(0px)" }
            : undefined
        }
        className="relative size-full"
        initial={{ opacity: 0, x: `${fromX}%`, y: `${fromY}%`, scale: 0.35, filter: "blur(10px)" }}
        transition={burst}
      >
        <motion.button
          animate={{ scale: active ? 1.08 : 1 }}
          aria-label={caption}
          className={cn(
            "block size-full cursor-default touch-manipulation rounded-full bg-white p-[5%] outline-none select-none",
            "shadow-[0_0_0_1px_rgba(15,23,42,0.05),0_8px_20px_-10px_rgba(15,23,42,0.4)]",
            "focus-visible:ring-2 focus-visible:ring-[#1f5fd1] focus-visible:ring-offset-2"
          )}
          onBlur={() => onDeactivate(index)}
          onClick={() => onActivate(index)}
          onFocus={() => onActivate(index)}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") onActivate(index);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") onDeactivate(index);
          }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          type="button"
        >
          {avatar.src && !failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="size-full rounded-full object-cover"
              decoding="async"
              draggable={false}
              onError={() => setFailed(true)}
              ref={checkImage}
              src={avatar.src}
            />
          ) : (
            <span
              className={cn(
                "flex size-full items-center justify-center rounded-full font-medium",
                BLUE_PILL
              )}
              style={{ fontSize: `${(slot.size / STAGE_WIDTH) * 100 * 0.34}cqw` }}
            >
              {initials(avatar.name)}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {active ? <Caption align={align} below={below} key="caption" text={caption} /> : null}
        </AnimatePresence>
      </motion.div>
    </li>
  );
}

export function ExpandingAvatars({
  avatars = DEFAULT_AVATARS,
  badge = "niche-specific creators",
  heading = "who make you viral",
  label = "Creators",
  seed = 9,
  className,
}: ExpandingAvatarsProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(stageRef, { once: true, amount: 0.3 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const slots = useMemo(() => layoutAvatars(avatars.length, seed), [avatars.length, seed]);

  const activate = useCallback((index: number) => setActiveIndex(index), []);
  const deactivate = useCallback(
    (index: number) => setActiveIndex((current) => (current === index ? null : current)),
    []
  );

  const textIn = (delay: number) => ({
    initial: { opacity: 0, y: 8, filter: "blur(6px)" },
    animate: revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    // Transforms snap under reduced motion; avatars still fade in place.
    <MotionConfig reducedMotion="user">
      <div className={cn("@container relative mx-auto w-full max-w-[720px] select-none", className)}>
        <div
          className="relative isolate aspect-[4/3] w-full"
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveIndex(null);
          }}
          onPointerDown={(e) => {
            // A tap on empty space closes the pill on touch screens.
            if (!(e.target as HTMLElement).closest("button")) setActiveIndex(null);
          }}
          ref={stageRef}
        >
          <ul aria-label={label} className="absolute inset-0 m-0 list-none p-0">
            {avatars.map((avatar, index) => (
              <AvatarBubble
                active={activeIndex === index}
                avatar={avatar}
                index={index}
                key={`${index}-${avatar.name}-${avatar.src ?? ""}`}
                onActivate={activate}
                onDeactivate={deactivate}
                revealed={revealed}
                slot={slots[index]!}
              />
            ))}
          </ul>

          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-[1.4cqw] px-[28%] text-center">
            {badge ? (
              <motion.span
                {...textIn(0)}
                className={cn(
                  "rounded-full px-[1.3cqw] py-[0.5cqw] text-[clamp(10px,1.8cqw,13px)] leading-tight font-medium whitespace-nowrap",
                  BLUE_PILL
                )}
              >
                {badge}
              </motion.span>
            ) : null}
            {heading ? (
              <motion.h2
                {...textIn(0.06)}
                className="m-0 text-[clamp(16px,4cqw,30px)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-zinc-900"
              >
                {heading}
              </motion.h2>
            ) : null}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default ExpandingAvatars;
