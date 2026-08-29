/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                       TestimonialWidget.tsx                             │
 * │              Animated Testimonial Card — copy-paste ready               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  INSTALL (one dependency):                                              │
 * │    npm install framer-motion                                            │
 * │                                                                         │
 * │  USAGE — Next.js App Router:                                            │
 * │    import TestimonialWidget from "@/components/TestimonialWidget";      │
 * │    export default function Page() { return <TestimonialWidget />; }    │
 * │                                                                         │
 * │  USAGE — Vite / CRA (remove "use client" at the top):                  │
 * │    import TestimonialWidget from "./TestimonialWidget";                 │
 * │    function App() { return <TestimonialWidget />; }                     │
 * │                                                                         │
 * │  CUSTOMISE:                                                             │
 * │    • Edit the TESTIMONIALS array below with your own data               │
 * │    • Swap photoSrc/photoSrcSet with your own image URLs                 │
 * │    • Change AUTO_ROTATE_MS to adjust slide speed (ms)                   │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  Features:                                                              │
 * │    ✦ Word-by-word spring quote reveal (stagger animation)               │
 * │    ✦ RAF-driven progress bar — pauses on hover                          │
 * │    ✦ Spring-physics thumbnail strip (infinite scroll)                   │
 * │    ✦ Framer Motion GPU-accelerated transitions throughout               │
 * │    ✦ 4K Unsplash portraits with responsive srcSet                       │
 * │    ✦ Zero CSS files needed — all styles are inline                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

"use client"; // Remove this line if you are NOT using Next.js App Router

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  useTransform,
  type Variants,
  type Transition,
} from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT YOUR DATA HERE
// ─────────────────────────────────────────────────────────────────────────────

interface Testimonial {
  name: string;       // Person's full name
  role: string;       // Title / company
  quote: string;      // Testimonial body text
  stats: {            // Up to 2 stat tiles shown at the bottom
    value: string;
    label: string;
  }[];
  photoSrc: string;    // Main image URL (used as fallback)
  photoSrcSet: string; // Responsive srcSet — browser picks best resolution
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Juan Remin",
    role: "CEO of Ridwan Tech",
    quote:
      "Switching to this platform transformed the way our team collaborates. Everything is faster, cleaner, and incredibly intuitive. We saw measurable improvements within the first few weeks.",
    stats: [
      { value: "3x",  label: "boost in conversion rate" },
      { value: "45%", label: "increase in page engagement" },
    ],
    photoSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=90&w=3840&auto=format&fit=crop&crop=face",
    photoSrcSet:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=90&w=400&auto=format&fit=crop&crop=face 400w, " +
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=90&w=800&auto=format&fit=crop&crop=face 800w, " +
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=90&w=3840&auto=format&fit=crop&crop=face 3840w",
  },
  {
    name: "Priya Nandan",
    role: "Head of Design at Luminos",
    quote:
      "The onboarding experience alone was enough to convince me. Within a week, my entire team was up and running with zero friction. I have never seen adoption happen this fast.",
    stats: [
      { value: "2.8x", label: "faster onboarding" },
      { value: "60%",  label: "reduction in support tickets" },
    ],
    photoSrc:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=90&w=3840&auto=format&fit=crop&crop=face",
    photoSrcSet:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=90&w=400&auto=format&fit=crop&crop=face 400w, " +
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=90&w=800&auto=format&fit=crop&crop=face 800w, " +
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=90&w=3840&auto=format&fit=crop&crop=face 3840w",
  },
  {
    name: "Marcus Oyelaran",
    role: "CTO at Bridgepoint",
    quote:
      "We integrated this into our stack in a single afternoon. The API is clean, the docs are excellent, and the support is genuinely world-class. Highly recommended for any engineering team.",
    stats: [
      { value: "4x",  label: "developer velocity" },
      { value: "30%", label: "decrease in build time" },
    ],
    photoSrc:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=90&w=3840&auto=format&fit=crop&crop=face",
    photoSrcSet:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=90&w=400&auto=format&fit=crop&crop=face 400w, " +
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=90&w=800&auto=format&fit=crop&crop=face 800w, " +
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=90&w=3840&auto=format&fit=crop&crop=face 3840w",
  },
  {
    name: "Michael Ross",
    role: "VP of Marketing at Nearfield",
    quote:
      "Our campaigns used to take days to set up. Now we are live in hours. The analytics layer is incredible — we have insight into everything we care about without any custom reporting.",
    stats: [
      { value: "5x",  label: "campaign launch speed" },
      { value: "22%", label: "lift in click-through rate" },
    ],
    photoSrc:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=90&w=3840&auto=format&fit=crop&crop=face",
    photoSrcSet:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=90&w=400&auto=format&fit=crop&crop=face 400w, " +
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=90&w=800&auto=format&fit=crop&crop=face 800w, " +
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=90&w=3840&auto=format&fit=crop&crop=face 3840w",
  },
  {
    name: "Olivia Bennett",
    role: "Founder at Bloom Studio",
    quote:
      "As a solo founder juggling a hundred things, I needed something that just worked. This platform removed so much overhead from my day. It has become completely indispensable.",
    stats: [
      { value: "10h", label: "saved per week" },
      { value: "90%", label: "client satisfaction score" },
    ],
    photoSrc:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=90&w=3840&auto=format&fit=crop&crop=face",
    photoSrcSet:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=90&w=400&auto=format&fit=crop&crop=face 400w, " +
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=90&w=800&auto=format&fit=crop&crop=face 800w, " +
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=90&w=3840&auto=format&fit=crop&crop=face 3840w",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️  CONFIG — tweak timing / layout here
// ─────────────────────────────────────────────────────────────────────────────

const AUTO_ROTATE_MS  = 5000; // ms per slide
const THUMB_HEIGHT    = 168;  // px — thumbnail card height
const THUMB_GAP       = 14;   // px — gap between thumbnails
const THUMB_STRIDE    = THUMB_HEIGHT + THUMB_GAP; // 182
const CONTAINER_HEIGHT = 550; // px — total widget height

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers (no need to edit below this line)
// ─────────────────────────────────────────────────────────────────────────────

const COUNT = TESTIMONIALS.length;

const springTrans: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 36,
  mass: 0.9,
};

// Word-by-word quote variants
const wordContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.028, delayChildren: 0 } },
  exit:  { transition: { staggerChildren: 0.012, staggerDirection: -1 } },
};

const wordItemVariants: Variants = {
  hidden: { opacity: 0, y: "40%", filter: "blur(4px)" },
  show: {
    opacity: 1, y: "0%", filter: "blur(0px)",
    transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.6 } as Transition,
  },
  exit: {
    opacity: 0, y: "-20%", filter: "blur(2px)",
    transition: { duration: 0.14, ease: "easeIn" } as Transition,
  },
};

// Fade-up variant (author + stats)
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 340, damping: 34, mass: 0.7, delay: 0.18 } as Transition,
  },
  exit: {
    opacity: 0, y: -8, filter: "blur(2px)",
    transition: { duration: 0.12, ease: "easeIn" } as Transition,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedQuote({ text, id }: { text: string; id: number }) {
  const words = text.split(" ");
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        variants={wordContainerVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        style={{
          fontFamily: '"Geist", "Geist Placeholder", sans-serif',
          fontSize: 29,
          fontWeight: 400,
          letterSpacing: "-0.017em",
          lineHeight: "1.38em",
          color: "rgb(17,17,18)",
          maxWidth: 520,
          margin: 0,
          willChange: "transform",
        }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={wordItemVariants}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              paddingBottom: "0.14em",
              marginBottom: "-0.14em",
              marginRight: i < words.length - 1 ? "0.28em" : 0,
              willChange: "transform, opacity, filter",
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

function ProgressBar({
  active,
  isHovered,
  onAdvance,
}: {
  active: number;
  isHovered: boolean;
  onAdvance: () => void;
}) {
  const segmentH    = CONTAINER_HEIGHT / COUNT;
  const rawProgress = useMotionValue(0);
  const springTop   = useSpring(active * segmentH, { stiffness: 300, damping: 36, mass: 0.9 });
  const indicatorH  = useTransform(rawProgress, [0, 1], [0, segmentH]);

  useEffect(() => { springTop.set(active * segmentH); }, [active, springTop, segmentH]);

  const rafRef       = useRef<number>(0);
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rawProgress.set(0);
    let startTime = 0, totalPaused = 0, pauseStart = 0;

    function tick(now: number) {
      if (startTime === 0) startTime = now;
      if (isHoveredRef.current) {
        if (pauseStart === 0) pauseStart = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (pauseStart !== 0) { totalPaused += now - pauseStart; pauseStart = 0; }
      const p = Math.min((now - startTime - totalPaused) / AUTO_ROTATE_MS, 1);
      rawProgress.set(p);
      if (p >= 1) { onAdvance(); return; }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div style={{ position: "relative", width: 2, height: CONTAINER_HEIGHT, background: "rgb(229,228,224)", borderRadius: 2, flex: "none", overflow: "hidden" }}>
      {active > 0 && (
        <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: active * segmentH, background: "rgb(17,17,18)", borderRadius: 2 }} />
      )}
      <motion.div style={{ position: "absolute", left: 0, width: 2, borderRadius: 2, background: "rgb(17,17,18)", top: springTop, height: indicatorH, willChange: "transform, height" }} />
    </div>
  );
}

function ThumbnailStrip({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  const springY = useSpring(-(active * THUMB_STRIDE), { stiffness: 260, damping: 32, mass: 1 });
  useEffect(() => { springY.set(-(active * THUMB_STRIDE)); }, [active, springY]);

  const items = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div style={{ position: "relative", width: 132, height: CONTAINER_HEIGHT, overflow: "hidden", flex: "none", WebkitMaskImage: "linear-gradient(180deg,#000 0%,#000 70%,transparent 100%)", maskImage: "linear-gradient(180deg,#000 0%,#000 70%,transparent 100%)" }}>
      <motion.div style={{ position: "absolute", inset: 0, y: springY, willChange: "transform" }}>
        {items.map((t, i) => {
          const realIndex = i % COUNT;
          const isActive  = realIndex === active;
          return (
            <motion.button
              key={i}
              aria-label={`Show testimonial from ${t.name}`}
              onClick={() => onChange(realIndex)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={springTrans}
              style={{ position: "absolute", top: 0, left: 0, width: 132, height: THUMB_HEIGHT, borderRadius: 2, overflow: "hidden", y: i * THUMB_STRIDE, background: "rgb(229,228,224)", cursor: "pointer", border: "none", padding: 0, willChange: "transform" }}
            >
              <motion.img
                src={t.photoSrc}
                srcSet={t.photoSrcSet}
                alt={t.name}
                draggable={false}
                animate={{ scale: isActive ? 1 : 1.06, opacity: isActive ? 1 : 0.36, filter: isActive ? "grayscale(0%)" : "grayscale(100%)" }}
                transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.8 } as Transition}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none", willChange: "transform, opacity, filter" }}
              />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

function StatsGrid({ stats, id }: { stats: { value: string; label: string }[]; id: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        style={{ marginTop: "auto", paddingTop: 22, borderTop: "1px solid rgb(229,228,224)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 320, damping: 30, mass: 0.7, delay: 0.32 + i * 0.07 } as Transition }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.1 } as Transition }}
          >
            <div style={{ fontFamily: '"Inter","Inter Placeholder",sans-serif', fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: "1.2em", color: "rgb(17,17,18)", fontVariantNumeric: "tabular-nums" }}>
              {s.value}
            </div>
            <div style={{ fontFamily: '"Inter","Inter Placeholder",sans-serif', fontSize: 11, fontWeight: 400, letterSpacing: "0.06em", lineHeight: "1.4em", color: "rgb(140,140,135)", marginTop: 4, textTransform: "uppercase" }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎯 Main export — drop this anywhere in your app
// ─────────────────────────────────────────────────────────────────────────────

export default function TestimonialWidget() {
  const [active, setActive]     = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const advance = useCallback(() => setActive((p) => (p + 1) % COUNT), []);
  const goTo    = useCallback((i: number) => setActive(i), []);

  const t = TESTIMONIALS[active];

  return (
    <>
      {/* Fonts — Geist (quote) + Inter (UI text) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');
        @font-face {
          font-family: 'Geist';
          src: url('https://elevatetestimonial.framer.website/assets/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOMImpna-aHR0cHM6.woff2') format('woff2');
          font-weight: 400; font-style: normal; font-display: swap;
        }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #fff; -webkit-font-smoothing: antialiased; }
      `}</style>

      {/* Page wrapper */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f6", padding: "24px" }}>

        {/* Card */}
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 26, mass: 1 } as Transition}
          style={{ display: "flex", alignItems: "stretch", gap: 56, background: "#fff", borderRadius: 10, padding: 48, boxSizing: "border-box", color: "rgb(17,17,18)", width: "min(780px, 100%)", minHeight: CONTAINER_HEIGHT, boxShadow: "0 0 0 1px rgba(0,0,0,0.055), 0 4px 16px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.06)", willChange: "transform" }}
        >
          {/* ← Left column */}
          <div style={{ display: "flex", gap: 18, flex: "none" }}>
            <ProgressBar active={active} isHovered={isHovered} onAdvance={advance} />
            <ThumbnailStrip active={active} onChange={goTo} />
          </div>

          {/* → Right column */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: CONTAINER_HEIGHT }}>
            <AnimatedQuote text={t.quote} id={active} />

            <AnimatePresence mode="wait">
              <motion.div key={`author-${active}`} variants={fadeUpVariants} initial="hidden" animate="show" exit="exit" style={{ marginTop: 30, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", willChange: "transform, opacity" }}>
                <span style={{ fontFamily: '"Inter","Inter Placeholder",sans-serif', fontSize: 14, fontWeight: 400, lineHeight: "1.3em", color: "rgb(17,17,18)" }}>
                  {t.name}
                </span>
                <span style={{ fontFamily: '"Inter","Inter Placeholder",sans-serif', fontSize: 12.5, fontWeight: 400, lineHeight: "1.3em", color: "rgb(140,140,135)" }}>
                  {t.role}
                </span>
              </motion.div>
            </AnimatePresence>

            <StatsGrid stats={t.stats} id={active} />
          </div>
        </motion.div>

      </div>
    </>
  );
}
