"use client";

import * as React from "react";

export type DrawerPhase =
  | "tucked"
  | "extracting"
  | "landing"
  | "revealed"
  | "unflipping"
  | "aligning_side"
  | "sliding_in";

export const COPY = {
  title: "Think different",
  subtitle: "One more thing",
  badge: "#1984",
  message:
    "Taste is not a committee. If it needs explaining, it isn’t finished. Cut until it is obvious, then ship.",
  punchline: "Stay hungry. Stay foolish.",
};

type FolderShellProps = {
  title?: string;
  sleeveFill: string;
  letterFill: string;
  cover: React.ReactNode;
  letterFront: React.ReactNode;
  letterBack: React.ReactNode;
  peekTab?: React.ReactNode;
  coverStyle?: React.CSSProperties;
  tuckX?: number;
};

function cardTransform(phase: DrawerPhase, hovered: boolean, tuckX: number) {
  const hoverX = tuckX + 22;
  if (phase === "tucked") {
    return hovered
      ? `translate3d(${hoverX}px, 0px, 2px) scale(0.97) rotate(0deg) rotateY(0deg)`
      : `translate3d(${tuckX}px, 0px, 2px) scale(0.96) rotate(0deg) rotateY(0deg)`;
  }
  if (phase === "extracting") {
    return "translate3d(330px, -2px, 4px) scale(1) rotate(1deg) rotateY(0deg)";
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
    return "translate3d(330px, -2px, 4px) scale(1) rotate(0deg) rotateY(0deg)";
  }
  if (phase === "sliding_in") {
    return `translate3d(${tuckX}px, 0px, 2px) scale(0.96) rotate(0deg) rotateY(0deg)`;
  }
  return `translate3d(${tuckX}px, 0, 2px)`;
}

function cardTransition(phase: DrawerPhase, reduced: boolean) {
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

export function FolderShell({
  title = COPY.title,
  sleeveFill,
  letterFill,
  cover,
  letterFront,
  letterBack,
  peekTab,
  coverStyle,
  tuckX = 24,
}: FolderShellProps) {
  const [phase, setPhase] = React.useState<DrawerPhase>("tucked");
  const [hovered, setHovered] = React.useState(false);
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
  const [canHover, setCanHover] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
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

  React.useEffect(() => {
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
    const next: DrawerPhase =
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

  const busy =
    phase !== "tucked" && phase !== "revealed";

  const onToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (busy) return;
    if (phase === "tucked") setPhase(reduced ? "revealed" : "extracting");
    else if (phase === "revealed") setPhase(reduced ? "tucked" : "unflipping");
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

  return (
    <div className="relative flex flex-col items-center font-synthesis-none antialiased">
      <div
        ref={wrapRef}
        className="relative h-[400px] w-[320px] cursor-pointer rounded-[22px] touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        style={{
          perspective: "2000px",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${lift ? -4 : 0}px)`,
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
            background: sleeveFill,
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
            width: 282,
            height: 354,
            left: "calc(50% - 141px)",
            top: "calc(50% - 177px)",
            transform: cardTransform(phase, hovered && canHover, tuckX),
            transformStyle: "preserve-3d",
            zIndex: inFront ? 50 : 3,
            transition: cardTransition(phase, reduced),
            boxShadow: inFront
              ? "0 0 0 1px rgb(0 0 0 / 0.08), 0 24px 48px -12px rgb(0 0 0 / 0.35)"
              : "0 0 0 1px rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.08)",
            background: letterFill,
          }}
        >
          {peekTab ? (
            <div
              className="pointer-events-none absolute -right-[22px] top-1/2 flex h-32 w-[22px] -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-r-lg"
              style={{
                opacity: inFront ? 0 : 1,
                transition: reduced ? "none" : "opacity 150ms ease-out",
              }}
            >
              {peekTab}
            </div>
          ) : null}

          <div
            className="absolute inset-0 overflow-hidden rounded-[18px]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(0deg) translateZ(1px)",
              background: letterFill,
            }}
          >
            {letterFront}
          </div>
          <div
            className="absolute inset-0 overflow-hidden rounded-[18px]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)",
              background: letterFill,
            }}
          >
            {letterBack}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]"
          style={{
            background: sleeveFill,
            transform: "translate3d(0, 0, 8px)",
            zIndex: 10,
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06)",
            ...coverStyle,
          }}
        >
          {cover}
        </div>
      </div>
    </div>
  );
}
