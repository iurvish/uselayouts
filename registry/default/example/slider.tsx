"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const SP = {
  type: "spring" as const,
  stiffness: 520,
  damping: 42,
  mass: 0.72,
};

// Underdamped on purpose (damping ratio < 1) so the bar-size change
// actually overshoots and settles instead of just easing in fast.
// SP above has a damping ratio > 1 (critically/over-damped) which is
// why it never visibly "springs" even though it's a spring() curve.
const SIZE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 16,
  mass: 1,
};

const INSTANT = { duration: 0 };

// Once either share gets thin the bar has no business being a tall slab, so it collapses to a pill.
const NARROW_THRESHOLD = 30;
const TALL_HEIGHT = 56;
const SHORT_HEIGHT = 26;
const GAP = 12;
const LABEL_INSET = 20;
/** The label's own line box, and how far clear of the bar it sits once it has to step out. */
const LABEL_LINE = 18;
const ABOVE_GAP = 12;

// Presence, not brightness. The fills are translucent tints now, so brightening one would wash it out
// against a light page rather than strengthen it — the old brightness() read backwards the moment the
// bars stopped being solid slabs. Opacity says the same thing in both themes: at 50/50 both sides sit at
// BASE, and as a share grows its tint firms up while the other thins out. left% + right% always sum to
// 100, so this alone makes whichever side is ahead read stronger, with no comparison needed.
const BASE_PRESENCE = 0.8;
const PRESENCE_SWING = 0.2;
const presenceFor = (pct: number) => BASE_PRESENCE + PRESENCE_SWING * ((pct - 50) / 50);

/* Two tints and their ink, per theme. The fills are deliberately light and translucent so they read as a
 * wash over whatever sits behind them; the ink is picked for the colour each tint actually composites to,
 * and every pair clears WCAG AA on its own ground (lowest is the dark coffee word at 5.8:1). The dark
 * selector mirrors the project's own `dark` variant so a .light island inside a dark page still wins. */
const THEME = `
.ratio-slider {
  --coffee-fill: oklch(0.72 0.15 48);
  --coffee-word: oklch(0.5 0.07 48);
  --coffee-num: oklch(0.46 0.14 40);
  --milk-fill: oklch(0.65 0.02 250);
  --milk-word: oklch(0.5 0.01 250);
  --milk-num: oklch(0.32 0.01 250);
  --coffee-alpha: 0.22;
  --milk-alpha: 0.16;
  --rule: oklch(0.35 0.02 250 / 0.5);
}
.ratio-slider:is(.dark *):not(:is(.light, .light *)) {
  --coffee-word: oklch(0.84 0.05 48);
  --coffee-num: oklch(0.82 0.105 46);
  --milk-fill: oklch(0.72 0.02 250);
  --milk-word: oklch(0.8 0.008 250);
  --milk-num: oklch(0.96 0.004 250);
  --coffee-alpha: 0.26;
  --rule: oklch(0.95 0 0 / 0.6);
}`;

const labelStyle: React.CSSProperties = {
  position: "absolute",
  height: LABEL_LINE,
  display: "flex",
  alignItems: "center",
  // A flex container drops whitespace-only children, so the space between the word and the figure has to
  // be a gap — written in em so it tracks the font size.
  gap: "0.4em",
  fontSize: 13,
  fontWeight: 500,
  // Wide tracking is what makes a short uppercase word read as a label rather than a cramped word.
  letterSpacing: "0.08em",
  whiteSpace: "nowrap",
  pointerEvents: "none",
};

const numberStyle: React.CSSProperties = {
  fontWeight: 700,
  // Tight on the figures, which carry none of the uppercase word's need for air, and tabular so the
  // digits hold their columns as the value runs — otherwise the label reflows on every pointermove and
  // takes the inside/outside fit test with it.
  letterSpacing: "-0.03em",
  fontVariantNumeric: "tabular-nums",
};

interface RatioSliderProps {
  defaultValue?: number;
  leftLabel?: string;
  rightLabel?: string;
  onChange?: (leftValue: number) => void;
}

export default function CoffeeMilkSlider({
  defaultValue = 65,
  leftLabel = "COFFEE",
  rightLabel = "MILK",
  onChange,
}: RatioSliderProps) {
  const [value, setValue] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const leftLabelRef = useRef<HTMLDivElement>(null);
  const rightLabelRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ track: 0, leftLabel: 0, rightLabel: 0 });

  // Whether a label still fits its own bar is a question about pixels, so measure them. Tabular figures
  // hold each label at a fixed width as the number runs, so this settles once instead of twitching.
  useEffect(() => {
    const read = () =>
      setBox({
        track: trackRef.current?.clientWidth ?? 0,
        leftLabel: leftLabelRef.current?.scrollWidth ?? 0,
        rightLabel: rightLabelRef.current?.scrollWidth ?? 0,
      });
    read();
    const observer = new ResizeObserver(read);
    if (trackRef.current) observer.observe(trackRef.current);
    if (leftLabelRef.current) observer.observe(leftLabelRef.current);
    if (rightLabelRef.current) observer.observe(rightLabelRef.current);
    return () => observer.disconnect();
  }, []);

  const left = Math.round(value);
  const right = 100 - left;
  const narrow = Math.min(left, right) < NARROW_THRESHOLD;
  const barHeight = narrow ? SHORT_HEIGHT : TALL_HEIGHT;
  const radius = narrow ? barHeight / 2 : 16;

  // Inside its bar while there is room for it, centred on the bar at whatever height that is; clear above
  // the whole track once there isn't. Each side answers for itself — one bar running out of room says
  // nothing about the other. The alternative is what the screenshot showed: the word crossing the divider
  // and sitting half on each fill.
  const fits = (pct: number, label: number) =>
    box.track === 0 || (box.track * pct) / 100 - GAP / 2 >= label + LABEL_INSET * 2;
  const labelBottom = (pct: number, label: number) =>
    fits(pct, label) ? (barHeight - LABEL_LINE) / 2 : barHeight + ABOVE_GAP;

  const leftPresence = presenceFor(left);
  const rightPresence = presenceFor(right);

  // Width/left must track the cursor 1:1 while dragging, or the fill lags
  // behind the pointer. Presence is derived straight from the percentage
  // too, so it gets the same treatment — instant while dragging, spring
  // otherwise. The label positions always spring: they only move when a
  // label runs out of room, not on every pointermove, so there is no
  // tracking cost to animating them.
  const segmentTransition = {
    width: dragging ? INSTANT : SP,
    opacity: dragging ? INSTANT : SP,
    borderRadius: SIZE_SPRING,
  };
  const dividerTransition = dragging ? INSTANT : SP;

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(1, Math.min(99, pct));
    setValue(clamped);
    onChange?.(Math.round(clamped));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setFromClientX(e.clientX);
    const onMove = (ev: PointerEvent) => setFromClientX(ev.clientX);
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="ratio-slider" style={{ width: "100%", maxWidth: 460, position: "relative", height: 100 }}>
      <style>{THEME}</style>
      <motion.div
        animate={{ height: barHeight }}
        transition={SIZE_SPRING}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <motion.div
          animate={{
            width: `calc(${left}% - ${GAP / 2}px)`,
            opacity: leftPresence,
            borderRadius: radius,
          }}
          transition={segmentTransition}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: "color-mix(in oklab, var(--coffee-fill) calc(var(--coffee-alpha) * 100%), transparent)",
          }}
        />

        <motion.div
          animate={{
            width: `calc(${right}% - ${GAP / 2}px)`,
            opacity: rightPresence,
            borderRadius: radius,
          }}
          transition={segmentTransition}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            background: "color-mix(in oklab, var(--milk-fill) calc(var(--milk-alpha) * 100%), transparent)",
          }}
        />

        <motion.div
          animate={{ left: `${left}%` }}
          transition={dividerTransition}
          style={{
            position: "absolute",
            top: "20%",
            height: "60%",
            width: 4,
            marginLeft: -2,
            borderRadius: 2,
            background: "var(--rule)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Fixed-height hit area so the drag target stays easy to grab even
          when the visible bar shrinks down to its narrow/pill state.
          cursor: ew-resize is the only "handle" — nothing sits on the line. */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: TALL_HEIGHT,
          cursor: "ew-resize",
          userSelect: "none",
        }}
      />

      <motion.div
        ref={leftLabelRef}
        animate={{ bottom: labelBottom(left, box.leftLabel) }}
        transition={SIZE_SPRING}
        style={{ ...labelStyle, left: LABEL_INSET, color: "var(--coffee-word)" }}
      >
        <span>{leftLabel}</span>
        <span style={{ ...numberStyle, color: "var(--coffee-num)" }}>{left}%</span>
      </motion.div>

      <motion.div
        ref={rightLabelRef}
        animate={{ bottom: labelBottom(right, box.rightLabel) }}
        transition={SIZE_SPRING}
        style={{ ...labelStyle, right: LABEL_INSET, color: "var(--milk-word)" }}
      >
        <span style={{ ...numberStyle, color: "var(--milk-num)" }}>{right}%</span>
        <span>{rightLabel}</span>
      </motion.div>
    </div>
  );
}