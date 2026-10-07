"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SNAPPY = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.6 };
const DRAG_SPRING = { type: "spring" as const, stiffness: 900, damping: 60, mass: 0.5 };
const PRICE_SP = { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.7 };

type Plan = "annual" | "lifetime";

const ANNUAL_PRICES = [50, 90, 120, 150, 200];
const LIFETIME_PRICES = [130, 220, 300, 380, 500];

const CAPTIONS = [
  "Your support keeps the essentials covered.",
  "You help fund steady improvements.",
  "You make thoughtful updates possible.",
  "You help us build with real care.",
  "Wow. You're backing the whole vision.",
];

const STEP_COUNT = CAPTIONS.length;

export default function PremiumPaywall() {
  const [plan, setPlan] = useState<Plan>("annual");
  const [step, setStep] = useState(3);

  const prices = plan === "annual" ? ANNUAL_PRICES : LIFETIME_PRICES;
  const price = prices[step];
  const priceSuffix = plan === "annual" ? "/year" : " once";

  return (
    <div
      className="not-prose mx-auto flex w-full max-w-[380px] flex-col items-center gap-7 rounded-[28px] border border-border bg-card px-7 py-9"
    >
      <h2
        style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.28, textAlign: "center" }}
        className="text-foreground"
      >
        Pick your price.
        <br />
        Support what matters.
      </h2>

      <SegmentedControl plan={plan} onChange={setPlan} />

      <PriceLabel price={price} suffix={priceSuffix} />

      <DetentSlider step={step} stepCount={STEP_COUNT} onChange={setStep} />

      <div style={{ minHeight: 42, display: "flex", alignItems: "center" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ fontSize: 15, fontWeight: 700, textAlign: "center", color: "#2f6fe4", margin: 0 }}
          >
            {CAPTIONS[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.96, opacity: 0.85 }}
        transition={SNAPPY}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 999,
          background: "#111",
          color: "#fff",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Continue with Premium
      </motion.button>
    </div>
  );
}

function SegmentedControl({ plan, onChange }: { plan: Plan; onChange: (p: Plan) => void }) {
  const options: { key: Plan; label: string }[] = [
    { key: "annual", label: "Annual" },
    { key: "lifetime", label: "Lifetime" },
  ];

  return (
    <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 999, background: "#ececec" }}>
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            position: "relative",
            padding: "10px 24px",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            color: plan === opt.key ? "#111" : "#8a8a8a",
          }}
        >
          {plan === opt.key && (
            <motion.div
              layoutId="segment-pill"
              transition={SNAPPY}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 999,
                background: "#fff",
                boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
              }}
            />
          )}
          <span style={{ position: "relative" }}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function PriceLabel({ price, suffix }: { price: number; suffix: string }) {
  const [prevPrice, setPrevPrice] = useState(price);
  const [direction, setDirection] = useState(0);
  if (price !== prevPrice) {
    setDirection(price > prevPrice ? 1 : -1);
    setPrevPrice(price);
  }

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
      <div style={{ position: "relative", overflow: "hidden", height: 64, display: "flex", alignItems: "center" }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={price}
            initial={{ y: direction >= 0 ? 30 : -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction >= 0 ? -30 : 30, opacity: 0 }}
            transition={PRICE_SP}
            style={{
              display: "block",
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
            className="text-foreground"
          >
            ${price}
          </motion.span>
        </AnimatePresence>
      </div>
      <span style={{ fontSize: 20, fontWeight: 700, paddingBottom: 6 }} className="text-foreground">
        {suffix}
      </span>
    </div>
  );
}

function DetentSlider({
  step,
  stepCount,
  onChange,
}: {
  step: number;
  stepCount: number;
  onChange: (step: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fingerProgress, setFingerProgress] = useState(0);
  const [width, setWidth] = useState(0);

  const HEIGHT = 56;
  const TRACK_HEIGHT = 30;
  const THUMB_SIZE = 46;
  const DOT_SIZE = 11;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inset = TRACK_HEIGHT / 2;
  const usable = Math.max(width - TRACK_HEIGHT, 1);
  const restingProgress = step / (stepCount - 1);
  const rawProgress = isDragging ? fingerProgress : restingProgress;
  const progress = rubberBanded(rawProgress);
  const thumbCenter = inset + usable * progress;

  function rubberBanded(p: number) {
    if (p < 0) return -overshootResistance(-p);
    if (p > 1) return 1 + overshootResistance(p - 1);
    return p;
  }
  function overshootResistance(overshoot: number) {
    return 0.06 * (1 - 1 / (8 * overshoot + 1));
  }

  function updateFromPointer(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = (clientX - rect.left - inset) / usable;
    setFingerProgress(p);
    const clamped = Math.min(Math.max(p, 0), 1);
    const nearest = Math.round(clamped * (stepCount - 1));
    if (nearest !== step) onChange(nearest);
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFromPointer(e.clientX);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  }
  function handlePointerUp() {
    setIsDragging(false);
  }

  const springNow = isDragging ? DRAG_SPRING : SNAPPY;

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        height: HEIGHT,
        touchAction: "none",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: (HEIGHT - TRACK_HEIGHT) / 2,
          left: 0,
          right: 0,
          height: TRACK_HEIGHT,
          borderRadius: 999,
          background: "#ececec",
        }}
      />

      <motion.div
        animate={{ width: Math.max(TRACK_HEIGHT, thumbCenter + inset) }}
        transition={springNow}
        style={{
          position: "absolute",
          top: (HEIGHT - TRACK_HEIGHT) / 2,
          left: 0,
          height: TRACK_HEIGHT,
          borderRadius: 999,
          background: "#3b82f6",
        }}
      />

      {Array.from({ length: stepCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            x: inset + usable * (i / (stepCount - 1)) - DOT_SIZE / 2,
            backgroundColor: i <= step ? "#3b82f6" : "#b8b8b8",
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            top: (HEIGHT - DOT_SIZE) / 2,
            left: 0,
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: "50%",
          }}
        />
      ))}

      <motion.div
        initial={false}
        animate={{ x: thumbCenter - THUMB_SIZE / 2, scale: isDragging ? 1.12 : 1 }}
        transition={springNow}
        style={{
          position: "absolute",
          top: (HEIGHT - THUMB_SIZE) / 2,
          left: 0,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: isDragging ? "0 9px 20px rgba(0,0,0,0.22)" : "0 5px 12px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: THUMB_SIZE - 18, height: THUMB_SIZE - 18, borderRadius: "50%", background: "#2f6fe4" }} />
      </motion.div>
    </div>
  );
}
