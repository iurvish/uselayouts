"use client";

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
} from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DrawerMotionPhase =
  | "tucked"
  | "extracting"
  | "landing"
  | "revealed"
  | "unflipping"
  | "aligning_side"
  | "sliding_in";

export interface ConfidentialFolderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  badge?: string;
  message?: string;
  punchline?: string;
  cover?: React.ReactNode;
  letterFront?: React.ReactNode;
  letterBack?: React.ReactNode;
  stage?: boolean;
  width?: number;
  height?: number;
  letterZIndex?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Letter sheet color. Default is near-white paper. */
  paper?: string;
}

const SLEEVE = "oklch(0.26 0.01 260)";
const PAPER = "oklch(0.962 0.014 95)";
const RULE = "oklch(0.28 0.02 95 / 0.14)";
const STAGE = "oklch(0.18 0.012 260)";
const BASE_W = 320;
const BASE_H = 400;
const LETTER_W = 282 / BASE_W;
const LETTER_H = 354 / BASE_H;
const LETTER_INSET_X = (BASE_W - 282) / 2 / BASE_W;
const LETTER_INSET_Y = (BASE_H - 354) / 2 / BASE_H;
const TUCK_PCT = (44 / 282) * 100;
const HOVER_PCT = (66 / 282) * 100;
const EXTRACT_PCT = (330 / 282) * 100;

const ORBIT_CX = 160;
const ORBIT_CY = 176;
const ORBIT_RX = 108;
const ORBIT_RY = 44;
const ORBIT_ROTS = [0, 26, 52, 78, 104, 130, 156];
const ORBIT_NODES: { deg: number; r: 2 | 1 }[][] = [
  [
    { deg: 8, r: 2 },
    { deg: 41, r: 1 },
    { deg: 54, r: 2 },
    { deg: 203, r: 1 },
  ],
  [
    { deg: 67, r: 2 },
    { deg: 188, r: 1 },
    { deg: 301, r: 2 },
  ],
  [
    { deg: 14, r: 1 },
    { deg: 22, r: 2 },
    { deg: 119, r: 1 },
    { deg: 246, r: 2 },
    { deg: 338, r: 1 },
  ],
  [
    { deg: 96, r: 2 },
    { deg: 271, r: 1 },
  ],
  [
    { deg: 33, r: 1 },
    { deg: 148, r: 2 },
    { deg: 161, r: 1 },
    { deg: 284, r: 2 },
  ],
  [
    { deg: 77, r: 1 },
    { deg: 215, r: 2 },
    { deg: 352, r: 1 },
  ],
  [
    { deg: 5, r: 2 },
    { deg: 128, r: 1 },
    { deg: 174, r: 2 },
    { deg: 319, r: 1 },
  ],
];

function cardTransform(phase: DrawerMotionPhase, hovered: boolean) {
  if (phase === "tucked") {
    return hovered
      ? `translate3d(${HOVER_PCT}%, 0px, 2px) scale(0.97) rotate(0deg) rotateY(0deg)`
      : `translate3d(${TUCK_PCT}%, 0px, 2px) scale(0.96) rotate(0deg) rotateY(0deg)`;
  }
  if (phase === "extracting") {
    return `translate3d(${EXTRACT_PCT}%, -2px, 4px) scale(1) rotate(1deg) rotateY(0deg)`;
  }
  if (phase === "landing") {
    return "translate3d(0px, -2px, 36px) scale(1.05) rotate(0deg) rotateY(0deg)";
  }
  if (phase === "revealed") {
    return "translate3d(0px, -2px, 36px) scale(1.05) rotate(-4deg) rotateY(180deg)";
  }
  if (phase === "unflipping") {
    return "translate3d(0px, -2px, 36px) scale(1.05) rotate(0deg) rotateY(0deg)";
  }
  if (phase === "aligning_side") {
    return `translate3d(${EXTRACT_PCT}%, -2px, 4px) scale(1) rotate(0deg) rotateY(0deg)`;
  }
  if (phase === "sliding_in") {
    return `translate3d(${TUCK_PCT}%, 0px, 2px) scale(0.96) rotate(0deg) rotateY(0deg)`;
  }
  return `translate3d(${TUCK_PCT}%, 0, 2px)`;
}

function cardTransition(phase: DrawerMotionPhase, reduced: boolean) {
  if (reduced) return "none";
  if (phase === "revealed") {
    return "transform 0.65s cubic-bezier(0.34, 1.35, 0.64, 1), box-shadow 0.65s ease";
  }
  if (phase === "unflipping") {
    return "transform 0.52s cubic-bezier(0.34, 1.25, 0.64, 1), box-shadow 0.52s ease";
  }
  if (phase === "aligning_side") {
    return "transform 0.35s cubic-bezier(0.2, 0.85, 0.35, 1.15)";
  }
  if (phase === "extracting") {
    return "transform 0.42s cubic-bezier(0.2, 0.85, 0.35, 1.15)";
  }
  if (phase === "landing") {
    return "transform 0.38s cubic-bezier(0.2, 0.9, 0.35, 1.1)";
  }
  if (phase === "sliding_in") {
    return "transform 0.42s cubic-bezier(0.2, 0.85, 0.35, 1.15)";
  }
  return "transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)";
}

function OrbitGraphic() {
  return (
    <svg
      viewBox="0 0 320 400"
      className="pointer-events-none absolute inset-0 h-full w-full select-none text-[oklch(0.58_0.016_260)]"
      aria-hidden
    >
      {ORBIT_ROTS.map((rot, i) => (
        <g key={rot} transform={`rotate(${rot} ${ORBIT_CX} ${ORBIT_CY})`}>
          <ellipse
            cx={ORBIT_CX}
            cy={ORBIT_CY}
            rx={ORBIT_RX}
            ry={ORBIT_RY}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          {ORBIT_NODES[i]!.map((node) => {
            const t = (node.deg * Math.PI) / 180;
            return (
              <circle
                key={node.deg}
                cx={Math.round(ORBIT_CX + ORBIT_RX * Math.cos(t))}
                cy={Math.round(ORBIT_CY + ORBIT_RY * Math.sin(t))}
                r={node.r}
                fill="currentColor"
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

function Colophon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10 text-[oklch(0.28_0.02_95)]"
      aria-hidden
    >
      <ellipse
        cx="24"
        cy="24"
        rx="16"
        ry="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="16"
        ry="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(60 24 24)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="16"
        ry="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(120 24 24)"
      />
    </svg>
  );
}

export const ConfidentialFolder = forwardRef<
  HTMLDivElement,
  ConfidentialFolderProps
>(
  (
    {
      title = "Stay hungry",
      subtitle = "For people who still build the work.",
      badge = "#1984",
      message = "Taste is not a committee. If it needs explaining, it isn’t finished. Cut until it is obvious, then ship.",
      punchline = "Stay hungry. Stay foolish.",
      cover,
      letterFront,
      letterBack,
      stage = true,
      width = BASE_W,
      height = BASE_H,
      letterZIndex = 999,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      paper = PAPER,
      className,
      ...props
    },
    ref,
  ) => {
    const [phase, setPhase] = useState<DrawerMotionPhase>(
      defaultOpen ? "revealed" : "tucked",
    );
    const [hovered, setHovered] = useState(false);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [canHover, setCanHover] = useState(false);
    const [reduced, setReduced] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
      const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
      const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const sync = () => {
        setCanHover(hoverMq.matches);
        setReduced(motionMq.matches);
      };
      sync();
      hoverMq.addEventListener("change", sync);
      motionMq.addEventListener("change", sync);
      return () => {
        hoverMq.removeEventListener("change", sync);
        motionMq.removeEventListener("change", sync);
      };
    }, []);

    useEffect(() => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (reduced) return;
      const wait =
        phase === "extracting"
          ? 380
          : phase === "landing"
            ? 320
            : phase === "unflipping"
              ? 500
              : phase === "aligning_side"
                ? 320
                : phase === "sliding_in"
                  ? 420
                  : 0;
      if (!wait) return;
      const next: DrawerMotionPhase =
        phase === "extracting"
          ? "landing"
          : phase === "landing"
            ? "revealed"
            : phase === "unflipping"
              ? "aligning_side"
              : phase === "aligning_side"
                ? "sliding_in"
                : "tucked";
      timerRef.current = window.setTimeout(() => setPhase(next), wait);
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }, [phase, reduced]);

    useEffect(() => {
      if (controlledOpen === undefined) return;
      if (controlledOpen) {
        setPhase((p) =>
          p === "tucked" ? (reduced ? "revealed" : "extracting") : p,
        );
      } else {
        setPhase((p) =>
          p === "revealed" ? (reduced ? "tucked" : "unflipping") : p,
        );
      }
    }, [controlledOpen, reduced]);

    const busy = phase !== "tucked" && phase !== "revealed";

    const onToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (busy) return;
      if (phase === "tucked") {
        setPhase(reduced ? "revealed" : "extracting");
        onOpenChange?.(true);
      } else if (phase === "revealed") {
        setPhase(reduced ? "tucked" : "unflipping");
        onOpenChange?.(false);
      }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(e);
      }
    };

    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!wrapRef.current || !canHover || reduced) return;
      const rect = wrapRef.current.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      });
    };

    const inFront =
      phase === "landing" ||
      phase === "revealed" ||
      phase === "unflipping" ||
      phase === "aligning_side";

    const tiltX = canHover && hovered && !reduced ? -mouse.y * 12 : 0;
    const tiltY = canHover && hovered && !reduced ? mouse.x * 12 : 0;
    const lift = canHover && hovered && phase === "tucked" && !reduced;
    const sx = width / BASE_W;
    const cut = `radial-gradient(circle ${18 * sx}px at 100% 50%, transparent ${16.5 * sx}px, #000 ${17.5 * sx}px)`;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col items-center justify-center font-sans font-synthesis-none antialiased",
          stage && "h-full min-h-[560px] w-full px-8 py-16",
          className,
        )}
        style={stage ? { background: STAGE } : undefined}
        {...props}
      >
        <div
          ref={wrapRef}
          className="relative max-w-full cursor-pointer overflow-visible touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          style={{
            width,
            aspectRatio: `${width} / ${height}`,
            perspective: "2000px",
            transformStyle: "preserve-3d",
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${lift ? -4 : 0}px)`,
            zIndex: inFront ? letterZIndex : undefined,
            transition: reduced
              ? "none"
              : "transform 150ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          onMouseMove={onMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            setMouse({ x: 0, y: 0 });
          }}
          role="button"
          tabIndex={0}
          aria-expanded={phase === "revealed"}
          aria-label={`${title} folder. ${phase === "revealed" ? "Close" : "Open"} the letter.`}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-[22px]"
            style={{
              background: SLEEVE,
              boxShadow: inFront
                ? "0 0 0 1px rgb(255 255 255 / 0.08), 0 28px 56px -16px rgb(0 0 0 / 0.5)"
                : hovered
                  ? "0 0 0 1px rgb(255 255 255 / 0.1), 0 22px 44px -14px rgb(0 0 0 / 0.42)"
                  : "0 0 0 1px rgb(255 255 255 / 0.08), 0 16px 32px -12px rgb(0 0 0 / 0.35)",
              transform: "translate3d(0, 0, 0px)",
              zIndex: 1,
              transition: reduced ? "none" : "box-shadow 150ms ease-out",
            }}
          />

          <div
            className="absolute rounded-[18px]"
            style={{
              width: `${LETTER_W * 100}%`,
              height: `${LETTER_H * 100}%`,
              left: `${LETTER_INSET_X * 100}%`,
              top: `${LETTER_INSET_Y * 100}%`,
              transform: cardTransform(phase, hovered && canHover),
              transformStyle: "preserve-3d",
              zIndex: inFront ? letterZIndex : 3,
              transition: cardTransition(phase, reduced),
              boxShadow: inFront
                ? "0 0 0 1px rgb(0 0 0 / 0.08), 0 24px 48px -12px rgb(0 0 0 / 0.35)"
                : "0 0 0 1px rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.08)",
              background: paper,
            }}
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-[18px]"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(0deg) translateZ(1px)",
                background: paper,
              }}
            >
              {letterFront ?? (
                <div className="flex h-full flex-col py-5 pr-3 pl-5 font-mono text-[10px] leading-[1.55] tracking-[0.01em] text-[oklch(0.42_0.02_95)]">
                  <p className="tracking-[0.14em] text-[oklch(0.32_0.02_95)] uppercase">
                    Product brief
                  </p>
                  <div className="mt-4 space-y-1">
                    <p>from: s.jobs@</p>
                    <p>to: the room</p>
                    <p>re: {title}</p>
                  </div>
                  <div className="mt-4 h-px" style={{ background: RULE }} />
                  <p className="mt-4 max-w-[36ch] text-pretty">
                    Do not design by committee. The work either sings in the
                    hand or it does not. Cut until a stranger understands it in
                    one look.
                  </p>
                  <ol className="mt-4 space-y-1 tabular-nums">
                    <li>1. Start with the feeling</li>
                    <li>2. Remove until it is obvious</li>
                    <li>3. Ship before you explain</li>
                  </ol>
                  <p className="mt-auto tracking-[0.12em] uppercase">{badge}</p>
                </div>
              )}
            </div>
            <div
              className="absolute inset-0 overflow-hidden rounded-[18px]"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg) translateZ(1px)",
                background: paper,
              }}
            >
              {letterBack ?? (
                <div className="flex h-full flex-col px-6 py-6">
                  <div
                    className="flex items-end justify-between gap-3 border-b pb-3"
                    style={{ borderColor: RULE }}
                  >
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.16em] text-[oklch(0.42_0.02_95)] uppercase">
                        Closed session
                      </p>
                      <p className="mt-1 font-sans text-[15px] leading-tight tracking-[-0.02em] text-[oklch(0.24_0.02_95)]">
                        The room
                      </p>
                    </div>
                    <span className="font-mono text-[10px] tabular-nums tracking-[0.08em] text-[oklch(0.45_0.02_95)]">
                      {badge}
                    </span>
                  </div>
                  <div className="my-auto space-y-3">
                    <p className="font-sans text-[15px] leading-[1.45] tracking-[-0.015em] text-[oklch(0.24_0.02_95)] text-pretty">
                      {message}
                    </p>
                    <p className="font-sans text-[13px] leading-[1.45] text-[oklch(0.45_0.02_95)] text-pretty">
                      {punchline}
                    </p>
                  </div>
                  <div
                    className="flex items-end justify-end border-t pt-3"
                    style={{ borderColor: RULE }}
                  >
                    <Colophon />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]"
            style={{
              background: SLEEVE,
              transform: "translate3d(0, 0, 8px)",
              zIndex: 10,
              boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06)",
              WebkitMaskImage: cut,
              maskImage: cut,
            }}
          >
            {cover ?? (
              <>
                <OrbitGraphic />
                <div className="relative flex h-full flex-col justify-end px-6 py-7">
                  <div>
                    <h3 className="font-sans text-[22px] leading-[1.12] tracking-[-0.03em] text-[oklch(0.94_0.01_260)]">
                      {title}
                    </h3>
                    <p className="mt-2 whitespace-nowrap font-sans text-[13px] leading-snug text-[oklch(0.68_0.01_260)]">
                      {subtitle}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ConfidentialFolder.displayName = "ConfidentialFolder";

export default ConfidentialFolder;
