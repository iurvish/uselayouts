"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// Damping ratio ζ = damping / (2·√(stiffness·mass)). Every spring here was sitting at ζ ≈ 0.92–1.02,
// which is critically damped or past it — a spring() curve that never actually springs. These sit lower,
// so the motion overshoots once and settles instead of just easing in.
const SP = { type: "spring" as const, stiffness: 260, damping: 24, mass: 0.9 }; // ζ ≈ 0.78
const SP_FAST = { type: "spring" as const, stiffness: 480, damping: 30, mass: 0.75 }; // ζ ≈ 0.79
// The card dropping back into the deck, and the deck fanning out around it: the most physical move here,
// so it gets the loosest ratio of the three.
const SP_SETTLE = { type: "spring" as const, stiffness: 240, damping: 20, mass: 1 }; // ζ ≈ 0.65
/** How long the browse exit keyframes run, and so how long the next/prev lock is held. */
const BROWSE_MS = 480;

// The heading used to drop in from above as one block. Text reads better arriving from below and
// resolving — so each line rises a little and pulls into focus, the second a beat behind the first.
const HEAD = {
  out: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  in: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};
const HEAD_LINE = {
  out: { opacity: 0, y: 10, filter: "blur(5px)", transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const } },
  in: { opacity: 1, y: 0, filter: "blur(0px)", transition: SP_FAST },
};

// One hue per card, identical lightness steps across the set, and chroma held at 70% of that hue's own
// sRGB ceiling — the same *share* for each, since a ceiling of 0.2 in magenta and 0.1 in green is what
// makes equal absolute chroma read as uneven vividness. The ramp only descends in L, so the white label
// at the foot of every card lands at APCA Lc ≈ 105 over the scrim, with no per-card fiddling.
const L_STOPS = [0.74, 0.6, 0.46];
const cardBg = (hue: number, chroma: number) =>
  `linear-gradient(155deg, ${L_STOPS.map(
    (l, i) => `oklch(${l} ${chroma} ${hue}) ${i * 50}%`,
  ).join(", ")})`;

// Real photographs rather than a drawn stand-in: a generated glow and silhouette reads as a placeholder
// however carefully it is tuned. Cropped and compressed at the CDN, so each card costs 60–90KB.
// Photos from Unsplash, free to use under the Unsplash licence.
const photo = (id: string) => `https://images.unsplash.com/${id}?w=600&h=720&fit=crop&q=70&auto=format`;

const CARDS = [
  {
    id: 0, label: "Greenfields", date: "Jul 9, 2022", hue: 163, chroma: 0.07,
    // A green meadow running back to rolling hills.
    src: photo("photo-1746898260024-497ff3b0be71"),
  },
  {
    id: 1, label: "Café Morning", date: "Jul 10, 2022", hue: 75, chroma: 0.068,
    // A cup steaming on a wooden table in window light.
    src: photo("photo-1771736385651-c071580a9d78"),
  },
  {
    id: 2, label: "City Lights", date: "Jul 11, 2022", hue: 254, chroma: 0.096,
    // Sydney after dark, the skyline doubled in the water.
    src: photo("photo-1551673052-7eb36841265e"),
  },
  {
    id: 3, label: "Sunset Rooftop", date: "Jul 12, 2022", hue: 45, chroma: 0.092,
    // Amsterdam roofs cut black against a golden hour sky.
    src: photo("photo-1558082552-e8e71b4a215e"),
  },
  {
    id: 4, label: "Night Market", date: "Jul 13, 2022", hue: 340, chroma: 0.14,
    // Food stalls and paper lanterns, Phu Quoc.
    src: photo("photo-1526139334526-f591a54b477c"),
  },
].map((card) => ({ ...card, bg: cardBg(card.hue, card.chroma) }));

type Card = (typeof CARDS)[number];

/** The photograph, over its card's own gradient so there is something in the frame while it loads. */
function Shot({ card, eager }: { card: Card; eager?: boolean }) {
  return (
    // A plain img, not next/image: this component gets copied into whatever app, and should not drag a
    // Next-only dependency and a remotePatterns entry along with it. The CDN already did the resizing.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={card.src}
      alt=""
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
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

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// A lit top edge, a tight contact shadow and a soft cast one. The contact shadow is what gives a control
// its edge against the page; the soft one alone just made the circles look like they were floating.
const RAISED =
  "inset 0 1px 0 oklch(1 0 0 / 0.9), inset 0 -1px 0 oklch(0 0 0 / 0.04), 0 1px 2px oklch(0 0 0 / 0.1), 0 6px 14px -4px oklch(0 0 0 / 0.16)";
const RAISED_DARK =
  "inset 0 1px 0 oklch(1 0 0 / 0.16), 0 2px 4px oklch(0 0 0 / 0.26), 0 10px 20px -6px oklch(0 0 0 / 0.36)";

const navButton = (filled: boolean) =>
  `${filled ? "bg-foreground text-background" : "border border-border bg-background text-foreground hover:bg-accent"} transition-colors ${FOCUS}`;

export default function MemoryCardStack() {
  const [phase, setPhase] = useState("stacked");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const total = CARDS.length;
  const current = CARDS[currentIndex];
  const isExpanded = phase === "expanded";
  // The two cards sitting behind this one. Hardcoding CARDS[1] and CARDS[2] showed the centre card twice
  // whenever the deck closed on one of them.
  // The two cards behind are the pile, not a window onto the deck. Deriving them from currentIndex meant
  // they swapped photographs on every turn, and wrapped around on the last card — the whole backdrop
  // reshuffling underneath the one card you were actually reading. They are fixed now, and keyed by their
  // slot rather than by card, so nothing behind ever unmounts or fades. Expanded, the centre card is
  // wider than both of them and covers them completely, so they only ever show as the fanned deck.
  const behind = [CARDS[1], CARDS[2]];
  // The primary button used to go dead on the last card: the one filled, obvious control in the row, and
  // on the final memory it just greyed out with nothing to say. It finishes the run instead — the deck has
  // been read, so the forward action becomes "done" and puts it back.
  const atEnd = currentIndex === total - 1;

  // Start just opens what is already on top. Rewinding here meant the first thing you saw after pressing
  // it was the deck swapping cards under you — the open and the rewind fighting for the same moment. The
  // deck rewinds itself once it has finished closing instead (see onAnimationComplete below), so by the
  // time anyone presses Start the first card is already face up and opening is only a grow.
  const handleStart = () => setPhase("expanded");
  // Closing is a collapse, not a page turn. Resetting the index here as well used to change the centre
  // card's key, so AnimatePresence fired the browse exit — a 480ms lateral slide built for next/prev —
  // while the frame shrank underneath it, and card 0 flew in from whichever side `direction` happened to
  // be left on, which after any forward browsing was the wrong one. Leaving the index alone keeps the
  // element mounted, so the card you were reading simply settles back into the deck.
  const handleClose = () => setPhase("stacked");

  // The browse exit is a keyframed tween, so the lock has to be held for exactly as long as it runs.
  const lock = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(lock.current), []);

  const browse = (step: 1 | -1) => {
    const next = currentIndex + step;
    if (isAnimating || next < 0 || next > total - 1) return;
    setIsAnimating(true);
    setDirection(step);
    setCurrentIndex(next);
    clearTimeout(lock.current);
    lock.current = setTimeout(() => setIsAnimating(false), BROWSE_MS);
  };

  const goNext = () => browse(1);
  const goPrev = () => browse(-1);

  // Frame dimensions — baked into the card's own variants so the same
  // motion.div both (a) grows in place when Start is pressed (center variant
  // recomputes with the new frame while the element stays mounted) and
  // (b) carries its real size/shadow with it while sliding during next/prev.
  const frame = isExpanded
    ? { width: 296, height: 352, borderRadius: 18, paddingBottom: 46,
        boxShadow: "0 20px 60px oklch(0 0 0 / 0.2), 0 4px 12px oklch(0 0 0 / 0.1)" }
    : { width: 200, height: 240, borderRadius: 12, paddingBottom: 36,
        boxShadow: "0 10px 32px oklch(0 0 0 / 0.15), 0 2px 6px oklch(0 0 0 / 0.08)" };

  const cardVariants = {
    // New card starts just off to the side, slightly behind/smaller — it's
    // already peeking into view as the old one starts to move.
    enter: (dir: number) =>
      dir === 0
        ? { x: 0, scale: 1, opacity: 0, zIndex: 10, ...frame }
        : { x: dir > 0 ? 120 : -120, scale: 0.86, opacity: 1, zIndex: 4, ...frame },
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 10,
      ...frame,
    },
    // Old card slides fully aside first (still up front, fully visible),
    // then eases back toward center while shrinking and dropping behind —
    // tucking out of sight behind the incoming card and the fan-out stack.
    // A leading `null` keyframe means "start from wherever this already is". Without it a thrown card
    // snapped back to centre before beginning its exit, so every drag ended with a jolt.
    exit: (dir: number) =>
      dir === 0
        ? { opacity: 0, zIndex: 2, ...frame, transition: { duration: 0.16 } }
        : {
            x: dir > 0 ? [null, -64, -16] : [null, 64, 16],
            scale: [null, 0.92, 0.82],
            opacity: 1,
            zIndex: [10, 10, 2],
            ...frame,
            transition: { duration: BROWSE_MS / 1000, times: [0, 0.55, 1], ease: [0.4, 0, 0.2, 1] as const },
          },
  };

  return (
    <div className="not-prose flex min-h-[620px] select-none flex-col items-center justify-center">

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 36, minHeight: 28 }}>
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div key="h-stacked" variants={HEAD} initial="out" animate="in" exit="out">
              <motion.div
                variants={HEAD_LINE}
                style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}
                className="text-foreground"
              >
                Revisit memories
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="h-expanded" variants={HEAD} initial="out" animate="in" exit="out">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.date}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }} className="text-foreground"
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
        width: 360, height: 400,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 40,
      }}>

        {/* Side cards — fan out when stacked, recede behind the center card when expanded */}
        {behind.map((card, slot) => {
          const i = slot + 1;

          return (
          <motion.div
            key={`slot-${slot}`}
            animate={isExpanded
              ? { x: 0, y: -(i * 9), scale: 1 - i * 0.055, rotate: 0, zIndex: 3 - i, opacity: 1 }
              : { x: i === 1 ? -75 : 75, y: i === 1 ? 12 : 10, scale: 0.88, rotate: i === 1 ? -10 : 10, zIndex: 1, opacity: 1 }
            }
            // Fanning back out trails the card settling into the middle of them, nearest card first.
            transition={{ ...SP_SETTLE, delay: isExpanded ? i * 0.03 : (2 - i) * 0.04 }}
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
                background: card.bg, borderRadius: 6,
                position: "relative", overflow: "hidden",
              }}>
                <Shot card={card} />
              </div>
            </div>
          </motion.div>
          );
        })}

        {/* Center card — grows in place on expand, slides-and-tucks-behind while browsing */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={isExpanded ? SP : SP_SETTLE}
            // Throw it aside to turn the page: past a third of the card, or flicked hard enough that it
            // was clearly on its way. Anything less and it snaps back, so a half-hearted drag is a no-op.
            drag={isExpanded && !isAnimating ? "x" : false}
            dragSnapToOrigin
            dragElastic={0.22}
            dragMomentum={false}
            // A card that didn't travel far enough comes back on a spring, like everything else here,
            // rather than Motion's default tween.
            dragTransition={{ bounceStiffness: 420, bounceDamping: 32 }}
            onDragEnd={(_, info) => {
              const thrown = Math.abs(info.offset.x) > frame.width / 3 || Math.abs(info.velocity.x) > 500;
              if (!thrown) return;
              if (info.offset.x < 0) goNext();
              else goPrev();
            }}
            onAnimationComplete={() => {
              // Back in the deck and not on the first card: put it back to the top, quietly, while nobody
              // is mid-gesture. Direction 0 keeps it from sliding.
              if (!isExpanded && currentIndex !== 0) {
                setDirection(0);
                setCurrentIndex(0);
              }
            }}
            style={{
              position: "absolute",
              padding: "10px 10px 0",
              overflow: "hidden",
              cursor: isExpanded ? "grab" : "default",
              willChange: "transform",
            }}
            whileDrag={{ cursor: "grabbing" }}
            className="bg-card border border-border"
          >
            <div style={{
              width: "100%", height: "100%",
              background: current.bg,
              borderRadius: isExpanded ? 8 : 6,
              position: "relative", overflow: "hidden",
            }}>
              <Shot card={current} eager />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
                background: "linear-gradient(to top, oklch(0 0 0 / 0.5), transparent)",
                pointerEvents: "none",
              }} />
              <span style={{
                position: "absolute", bottom: 12, left: 14, right: 14,
                fontSize: 13, fontWeight: 600, color: "oklch(1 0 0)", letterSpacing: "-0.01em",
                textShadow: "0 1px 3px oklch(0 0 0 / 0.4)",
              }}>
                {current.label}
              </span>
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
                animate={{ width: i === currentIndex ? 20 : 6 }}
                transition={SP_FAST}
                style={{ height: 6, borderRadius: 3 }}
                className={i === currentIndex ? "bg-foreground" : "bg-border"}
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
            whileTap={{ scale: 0.96 }}
            transition={SP_FAST}
            type="button"
            style={{
              padding: "12px 44px", borderRadius: 999,
              border: "none",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "-0.01em",
              boxShadow: RAISED_DARK,
            }}
            className={`bg-foreground text-background ${FOCUS}`}
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
              whileHover={currentIndex > 0 ? { scale: 1.04 } : {}}
              whileTap={currentIndex > 0 ? { scale: 0.96 } : {}}
              animate={{ opacity: currentIndex === 0 ? 0.45 : 1 }}
              disabled={currentIndex === 0}
              transition={SP_FAST}
              type="button"
              aria-label="Previous memory"
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                boxShadow: RAISED,
              }}
              className={navButton(false)}
            >
              <ChevronLeft />
            </motion.button>

            {/* Close */}
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={SP_FAST}
              type="button"
              aria-label="Close and return to the deck"
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: RAISED,
              }}
              className={navButton(false)}
            >
              <CloseIcon />
            </motion.button>

            {/* Next */}
            <motion.button
              onClick={atEnd ? handleClose : goNext}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={SP_FAST}
              type="button"
              aria-label={atEnd ? "Finish and put the deck away" : "Next memory"}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
              // Black is the finish, not the direction: while there are pages left this is just another
              // control, and it only fills in once pressing it ends the run.
              animate={{ boxShadow: atEnd ? RAISED_DARK : RAISED }}
              className={navButton(atEnd)}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={atEnd ? "done" : "next"}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={SP_FAST}
                  style={{ display: "flex" }}
                >
                  {atEnd ? <CheckIcon /> : <ChevronRight />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}