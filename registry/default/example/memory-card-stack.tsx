"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SP = { type: "spring" as const, stiffness: 220, damping: 26, mass: 0.9 };
const SP_FAST = { type: "spring" as const, stiffness: 480, damping: 36, mass: 0.75 };
const SP_SLOW = { type: "spring" as const, stiffness: 80, damping: 20, mass: 1.2 };

const CARDS = [
  { id: 0, label: "Greenfields",    date: "Jul 9, 2022",  bg: "linear-gradient(155deg, #74b49b 0%, #4a8c6f 40%, #2d6b50 100%)" },
  { id: 1, label: "Café Morning",   date: "Jul 10, 2022", bg: "linear-gradient(155deg, #c9a96e 0%, #a07840 50%, #6b4e2a 100%)" },
  { id: 2, label: "City Lights",    date: "Jul 11, 2022", bg: "linear-gradient(155deg, #8fa8c8 0%, #5d7fa8 40%, #3a5a80 100%)" },
  { id: 3, label: "Sunset Rooftop", date: "Jul 12, 2022", bg: "linear-gradient(155deg, #f4a261 0%, #e76f51 50%, #c1440e 100%)" },
  { id: 4, label: "Night Market",   date: "Jul 13, 2022", bg: "linear-gradient(155deg, #6d6875 0%, #b5838d 50%, #e5989b 100%)" },
];

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

export default function MemoryCardStack() {
  const [phase, setPhase] = useState("stacked");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const total = CARDS.length;
  const current = CARDS[currentIndex];
  const isExpanded = phase === "expanded";

  const handleStart = () => setPhase("expanded");
  const handleClose = () => {
    setPhase("stacked");
    setCurrentIndex(0);
  };

  const goNext = () => {
    if (isAnimating || currentIndex >= total - 1) return;
    setIsAnimating(true);
    setDirection(1);
    setCurrentIndex(i => i + 1);
    setTimeout(() => setIsAnimating(false), 480);
  };

  const goPrev = () => {
    if (isAnimating || currentIndex <= 0) return;
    setIsAnimating(true);
    setDirection(-1);
    setCurrentIndex(i => i - 1);
    setTimeout(() => setIsAnimating(false), 480);
  };

  // Frame dimensions — baked into the card's own variants so the same
  // motion.div both (a) grows in place when Start is pressed (center variant
  // recomputes with the new frame while the element stays mounted) and
  // (b) carries its real size/shadow with it while sliding during next/prev.
  const frame = isExpanded
    ? { width: 250, height: 295, borderRadius: 16, paddingBottom: 42,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)" }
    : { width: 200, height: 240, borderRadius: 12, paddingBottom: 36,
        boxShadow: "0 10px 32px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)" };

  const cardVariants = {
    // New card starts just off to the side, slightly behind/smaller — it's
    // already peeking into view as the old one starts to move.
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      scale: 0.86,
      zIndex: 4,
      ...frame,
    }),
    center: {
      x: 0,
      scale: 1,
      zIndex: 10,
      ...frame,
    },
    // Old card slides fully aside first (still up front, fully visible),
    // then eases back toward center while shrinking and dropping behind —
    // tucking out of sight behind the incoming card and the fan-out stack.
    exit: (dir: number) => ({
      x: dir > 0 ? [0, -64, -16] : [0, 64, 16],
      scale: [1, 0.92, 0.82],
      zIndex: [10, 10, 2],
      ...frame,
      transition: { duration: 0.48, times: [0, 0.55, 1], ease: [0.4, 0, 0.2, 1] as const },
    }),
  };

  return (
    <div className="not-prose flex min-h-[540px] select-none flex-col items-center justify-center">

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 40, minHeight: 52 }}>
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="h-stacked"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SP_FAST}
            >
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }} className="text-foreground">
                Revisit memories
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }} className="text-muted-foreground">
                2 years ago
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="h-expanded"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SP_FAST}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }} className="text-muted-foreground">2 years ago</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.date}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 2 }} className="text-foreground"
                >
                  {current.date}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Card area ── */}
      <div style={{
        position: "relative",
        width: 320, height: 340,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 40,
      }}>

        {/* Side cards — fan out when stacked, recede behind the center card when expanded */}
        {[1, 2].map((i) => (
          <motion.div
            key={CARDS[i].id + "-side"}
            animate={isExpanded
              ? { x: 0, y: -(i * 9), scale: 1 - i * 0.055, rotate: 0, zIndex: 3 - i, opacity: 1 }
              : { x: i === 1 ? -75 : 75, y: i === 1 ? 12 : 10, scale: 0.88, rotate: i === 1 ? -10 : 10, zIndex: 1, opacity: 1 }
            }
            transition={{ ...SP_SLOW, delay: isExpanded ? i * 0.03 : 0 }}
            style={{ position: "absolute", willChange: "transform" }}
          >
            <div style={{
              width: 200, height: 240,
              borderRadius: 12,
              padding: "10px 10px 36px",
              overflow: "hidden",
            }} className="bg-card border border-border">
              <div style={{
                width: "100%", height: "100%",
                background: CARDS[i].bg, borderRadius: 6,
              }} />
            </div>
          </motion.div>
        ))}

        {/* Center card — grows in place on expand, slides-and-tucks-behind while browsing */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SP}
            style={{
              position: "absolute",
              padding: "10px 10px 0",
              overflow: "hidden",
              willChange: "transform, width, height",
            }}
            className="bg-card border border-border"
          >
            <div style={{
              width: "100%", height: "100%",
              background: current.bg,
              borderRadius: isExpanded ? 8 : 6,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
                background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
              }} />
              <span style={{
                position: "absolute", bottom: 10, left: 10,
                fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em",
              }}>
                {current.label}
              </span>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "absolute", bottom: 10, right: 10, color: "rgba(255,255,255,0.75)" }}
                  >
                    <ExpandIcon />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Progress dots ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={SP_FAST}
            style={{ display: "flex", gap: 6, marginBottom: 24 }}
          >
            {CARDS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === currentIndex ? 20 : 6,
                  background: i === currentIndex ? "#1a1a1a" : "#ccc",
                }}
                transition={SP_FAST}
                style={{ height: 6, borderRadius: 3 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Buttons ── */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="start"
            onClick={handleStart}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={SP_FAST}
            style={{
              padding: "12px 44px", borderRadius: 999,
              background: "#1a1a1a", color: "#fff", border: "none",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "-0.01em",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            }}
          >
            Start
          </motion.button>
        ) : (
          <motion.div
            key="controls"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={SP_FAST}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            {/* Back */}
            <motion.button
              onClick={goPrev}
              whileHover={currentIndex > 0 ? { scale: 1.08, background: "#e0e0e0" } : {}}
              whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
              animate={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
              disabled={currentIndex === 0}
              transition={SP_FAST}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#e8e8e8", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer", color: "#444",
              }}
            >
              <ChevronLeft />
            </motion.button>

            {/* Close */}
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.06, background: "rgba(0,0,0,0.13)" }}
              whileTap={{ scale: 0.9 }}
              transition={SP_FAST}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(0,0,0,0.08)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#555",
              }}
            >
              <CloseIcon />
            </motion.button>

            {/* Next */}
            <motion.button
              onClick={goNext}
              whileHover={currentIndex < total - 1 ? { scale: 1.08, background: "#333" } : {}}
              whileTap={currentIndex < total - 1 ? { scale: 0.9 } : {}}
              animate={{ opacity: currentIndex === total - 1 ? 0.3 : 1 }}
              disabled={currentIndex === total - 1}
              transition={SP_FAST}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#1a1a1a", color: "#fff", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentIndex === total - 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronRight />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}