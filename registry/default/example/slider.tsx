"use client";

import { useRef, useState } from "react";
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

const NARROW_THRESHOLD = 30;
const TALL_HEIGHT = 64;
const SHORT_HEIGHT = 30;
const GAP = 12;
const INLINE_BOTTOM = 28;
const ABOVE_BOTTOM_GAP = 10;

// Max brightness deviation at the extremes (0% or 100%). At 50/50 both
// sides render at brightness(1) — no difference. As one side's share grows
// it brightens toward 1 + BRIGHTNESS_SWING while the other dims toward
// 1 - BRIGHTNESS_SWING. Since left% + right% always sum to 100, this alone
// is enough to make "whichever side is currently ahead" read brighter —
// no separate comparison needed.
const BRIGHTNESS_SWING = 0.18;
const brightnessFor = (pct: number) => 1 + BRIGHTNESS_SWING * ((pct - 50) / 50);

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

  const left = Math.round(value);
  const right = 100 - left;
  const narrow = Math.min(left, right) < NARROW_THRESHOLD;
  const barHeight = narrow ? SHORT_HEIGHT : TALL_HEIGHT;
  const radius = narrow ? barHeight / 2 : 16;
  const labelBottom = narrow ? barHeight + ABOVE_BOTTOM_GAP : INLINE_BOTTOM;

  const leftBrightness = brightnessFor(left);
  const rightBrightness = brightnessFor(right);

  // Width/left must track the cursor 1:1 while dragging, or the fill lags
  // behind the pointer. Brightness is derived straight from the percentage
  // too, so it gets the same treatment — instant while dragging, spring
  // otherwise. Radius (and the bar-height motion.div below) always spring —
  // they only change on the rare narrow/wide mode flip, not on every
  // pointermove, so there's no tracking cost to animating them.
  const segmentTransition = {
    width: dragging ? INSTANT : SP,
    filter: dragging ? INSTANT : SP,
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
    <div style={{ width: "100%", maxWidth: 640, position: "relative", height: 112 }}>
      <motion.div
        animate={{ height: barHeight }}
        transition={SIZE_SPRING}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <motion.div
          animate={{
            width: `calc(${left}% - ${GAP / 2}px)`,
            borderRadius: radius,
            filter: `brightness(${leftBrightness})`,
          }}
          transition={segmentTransition}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: "linear-gradient(180deg, #3a1f0d, #2a160a)",
          }}
        />

        <motion.div
          animate={{
            width: `calc(${right}% - ${GAP / 2}px)`,
            borderRadius: radius,
            filter: `brightness(${rightBrightness})`,
          }}
          transition={segmentTransition}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            background: "#3a3a3d",
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
            background: "#fff",
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
        animate={{ bottom: labelBottom }}
        transition={SIZE_SPRING}
        style={{
          position: "absolute",
          left: 20,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: "#c9764f",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {leftLabel}{" "}
        <span style={{ color: "#ff5a2e", fontWeight: 700 }}>{left}%</span>
      </motion.div>

      <motion.div
        animate={{ bottom: labelBottom }}
        transition={SIZE_SPRING}
        style={{
          position: "absolute",
          right: 20,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: "#c7c7ca",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 700 }}>{right}%</span>{" "}
        {rightLabel}
      </motion.div>
    </div>
  );
}