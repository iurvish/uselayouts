"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flag, CircleDot, Archive, CheckCircle2, Eye, Check } from "lucide-react";

const SP = { type: "spring" as const, stiffness: 520, damping: 42, mass: 0.72 };

const STEP_X = 0;       // horizontal cascade step per depth
const TILT = 0;           // constant rotation for every pill — the "deck of cards" look
const PILL_GAP = 10;      // uniform visual gap between any two stacked elements —
                           // header-to-first-pill included, not just pill-to-pill
const PILL_HEIGHT = 38;   // ~9px*2 padding + line height, used to size reserved space
const STACK_DEPTH = 5;    // total pills including current

// Each pill is anchored (via bottom: 100%) to the header's own TOP edge, then
// translated up by this much. Naively using a flat multiple of one constant
// gives the header→pill1 gap the FULL slot spacing (nothing above it to
// subtract), while every pill→pill gap is implicitly slot-spacing-minus-
// pill-height — so the bottom gap ends up much bigger than the rest even
// with one shared constant. This sums real gap + pillHeight per slot
// instead, so every gap (including the first) matches.
const slotY = (depth: number) =>
  -(depth * PILL_GAP + (depth - 1) * PILL_HEIGHT);
const slotX = (depth: number) => STEP_X * depth;

// Reserved space above/left of the header so the fanned-out stack — at its
// deepest (farthest) pill — stays fully inside this component's own box
// instead of overflowing into whatever ancestor happens to clip it.
const RESERVED_TOP = STACK_DEPTH * (PILL_HEIGHT + PILL_GAP) + 20;
const RESERVED_LEFT = Math.abs(STEP_X) * STACK_DEPTH + 24;

type StatusId = "changes" | "progress" | "archived" | "approved" | "review";

interface Status {
  id: StatusId;
  label: string;
  icon: typeof Flag;
  text: string;
  bg: string;
  border: string;
}

const STATUSES: Status[] = [
  { id: "changes",  label: "Changes requested", icon: Flag,        text: "#c2410c", bg: "#fbdac3", border: "#f3b78d" },
  { id: "progress", label: "In progress",       icon: CircleDot,   text: "#2f5fd6", bg: "#dbe6fd", border: "#aec6fb" },
  { id: "archived", label: "Archived",          icon: Archive,     text: "#3f3f3f", bg: "#f4f4f4", border: "#d8d8d8" },
  { id: "approved", label: "Approved",          icon: CheckCircle2,text: "#1f9254", bg: "#d9f3e3", border: "#a9e3c1" },
  { id: "review",   label: "Ready for review",  icon: Eye,         text: "#7c3aed", bg: "#ede3fb", border: "#cdb2f6" },
];

interface StatusFanProps {
  title: string;
  defaultStatusId?: StatusId;
}

export function StatusFan({
  title,
  defaultStatusId = "progress",
}: StatusFanProps) {
  const [statusId, setStatusId] = useState<StatusId>(defaultStatusId);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = STATUSES.find(s => s.id === statusId)!;
  const others = STATUSES.filter(s => s.id !== statusId);
  const Icon = current.icon;

  // The current status now sits at the front of the stack (depth 1, right
  // above the header) instead of being left out — that's what gives it
  // somewhere to slide FROM (the header) TO (its slot in the list) when
  // the picker opens, instead of only the other options appearing.
  const stack = [current, ...others];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (id: StatusId) => {
    setStatusId(id);
    setPicked(true);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className="not-prose"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        paddingTop: RESERVED_TOP,
        paddingLeft: RESERVED_LEFT,
      }}
    >
      {/* ── Header + Pills wrapper — pills fan above this ── */}
      <div style={{ position: "relative" }}>
        <AnimatePresence>
          {open && (
            <>
              {stack.map((opt, i) => {
                const OptIcon = opt.icon;
                const depth = i + 1; // 1 = current, nearest the header; higher = farther out
                const isCurrent = opt.id === current.id;
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => pick(opt.id)}
                    initial={{ opacity: 0, scale: 0.7, x: 0, y: 0, rotate: TILT }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: slotX(depth),
                      y: slotY(depth),
                      rotate: TILT,
                    }}
                    exit={{ opacity: 0, scale: 0.7, x: 0, y: 0, transition: { duration: 0.12 } }}
                    transition={{ ...SP, delay: (depth - 1) * 0.03 }}
                    whileHover={{ scale: 1.045 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      position: "absolute",
                      left: 14,
                      bottom: "100%",
                      transformOrigin: "0% 100%", // pivot at bottom-left so pills of
                                                   // different label widths still line
                                                   // up along the same diagonal instead
                                                   // of rotating around differing centers
                      zIndex: 30 - depth,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 16px 9px 12px",
                      borderRadius: 999,
                      border: `1.5px solid ${opt.border}`,
                      background: opt.bg,
                      color: opt.text,
                      fontSize: 14,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      boxShadow: isCurrent
                        ? `0 6px 16px rgba(0,0,0,0.10), 0 0 0 2px ${opt.border}`
                        : "0 6px 16px rgba(0,0,0,0.10)",
                    }}
                  >
                    <OptIcon size={15} strokeWidth={2.25} />
                    {opt.label}
                    {isCurrent && <Check size={14} strokeWidth={2.5} style={{ marginLeft: 2 }} />}
                  </motion.button>
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 12,
            border: `1.5px solid ${current.border}`,
            background: current.bg,
            position: "relative",
            zIndex: 10,
          }}
        >
          <motion.button
            onClick={() => setOpen(o => !o)}
            whileTap={{ scale: 0.9 }}
            transition={SP}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: current.text,
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Change status"
          >
            <Icon size={17} strokeWidth={2.25} />
          </motion.button>

          <div style={{ position: "relative", height: 20, flex: 1, overflow: "hidden" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={picked && !open ? "label" : "title"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: picked ? current.text : (open ? current.text : "#1a1a1a"),
                  whiteSpace: "nowrap",
                }}
              >
                {picked ? current.label : title}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Card body placeholder — swap for real content ── */}
      <div
        style={{
          marginTop: -1,
          padding: "28px 20px",
          borderRadius: "0 0 12px 12px",
          border: `1.5px solid ${current.border}`,
          borderTop: "none",
          background: "#f3efe8",
          minHeight: 140,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: current.text }}>
          ASTRA &nbsp;·&nbsp; MODEL 01
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4, color: current.text }}>
          Workbench
        </div>
      </div>
    </div>
  );
}