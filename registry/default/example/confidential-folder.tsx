"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
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
  logo?: React.ReactNode | string;
  message?: string;
  punchline?: string;
  stickerSrc?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  sleeveClassName?: string;
  cardClassName?: string;
}

export const CornerBookLogo = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center border border-white/15 bg-neutral-950/85 shadow-sm p-1.5",
      className
    )}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full text-white"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  </div>
);

export const ConfidentialFolder = forwardRef<HTMLDivElement, ConfidentialFolderProps>(
  (
    {
      title = "CONFIDENTIAL",
      subtitle = "Internal use only",
      badge = "#042",
      logo = <CornerBookLogo />,
      message = "You weren’t supposed to look inside.",
      punchline = "Curiosity wins every time.",
      stickerSrc = "https://framerusercontent.com/images/blqn41GFzRaYAkfhHyI0zi4yc.gif?width=200&height=200",
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      className,
      sleeveClassName,
      cardClassName,
      ...props
    },
    ref
  ) => {
    const [uncontrolledPhase, setUncontrolledPhase] = useState<DrawerMotionPhase>(
      defaultOpen ? "revealed" : "tucked"
    );
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isControlled = controlledOpen !== undefined;
    const currentPhase = uncontrolledPhase;

    const updatePhase = (next: DrawerMotionPhase) => {
      if (!isControlled) {
        setUncontrolledPhase(next);
      }
      onOpenChange?.(next === "revealed");
    };

    useEffect(() => {
      if (isControlled) {
        if (controlledOpen && currentPhase === "tucked") {
          setUncontrolledPhase("extracting");
        } else if (!controlledOpen && currentPhase === "revealed") {
          setUncontrolledPhase("unflipping");
        }
      }
    }, [controlledOpen, isControlled, currentPhase]);

    useEffect(() => {
      if (timerRef.current) clearTimeout(timerRef.current);

      if (currentPhase === "extracting") {
        timerRef.current = setTimeout(() => {
          updatePhase("landing");
        }, 380);
      } else if (currentPhase === "landing") {
        timerRef.current = setTimeout(() => {
          updatePhase("revealed");
        }, 320);
      } else if (currentPhase === "unflipping") {
        timerRef.current = setTimeout(() => {
          updatePhase("aligning_side");
        }, 500);
      } else if (currentPhase === "aligning_side") {
        timerRef.current = setTimeout(() => {
          updatePhase("sliding_in");
        }, 320);
      } else if (currentPhase === "sliding_in") {
        timerRef.current = setTimeout(() => {
          updatePhase("tucked");
        }, 420);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [currentPhase]);

    const handleAction = (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (currentPhase === "tucked") {
        updatePhase("extracting");
      } else if (currentPhase === "revealed") {
        updatePhase("unflipping");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAction(e);
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setMousePos({ x: 0, y: 0 });
    };

    const isCardInForeground =
      currentPhase === "landing" ||
      currentPhase === "revealed" ||
      currentPhase === "unflipping" ||
      currentPhase === "aligning_side";

    const tiltX = isHovered ? -mousePos.y * 12 : 0;
    const tiltY = isHovered ? mousePos.x * 12 : 0;

    const getCardTransform = () => {
      if (currentPhase === "tucked") {
        return isHovered
          ? "translate3d(46px, 0px, 2px) scale(0.97) rotate(0deg) rotateY(0deg)"
          : "translate3d(24px, 0px, 2px) scale(0.96) rotate(0deg) rotateY(0deg)";
      }
      if (currentPhase === "extracting") {
        return "translate3d(330px, -2px, 4px) scale(1.0) rotate(1deg) rotateY(0deg)";
      }
      if (currentPhase === "landing") {
        return "translate3d(0px, -2px, 36px) scale(1.05) rotate(0deg) rotateY(0deg)";
      }
      if (currentPhase === "revealed") {
        return "translate3d(0px, -2px, 36px) scale(1.05) rotate(-4deg) rotateY(180deg)";
      }
      if (currentPhase === "unflipping") {
        return "translate3d(0px, -2px, 36px) scale(1.05) rotate(0deg) rotateY(0deg)";
      }
      if (currentPhase === "aligning_side") {
        return "translate3d(330px, -2px, 4px) scale(1.0) rotate(0deg) rotateY(0deg)";
      }
      if (currentPhase === "sliding_in") {
        return "translate3d(24px, 0px, 2px) scale(0.96) rotate(0deg) rotateY(0deg)";
      }
      return "translate3d(24px, 0, 2px)";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative select-none flex flex-col items-center justify-center font-sans",
          className
        )}
        style={{
          perspective: "2000px",
          WebkitPerspective: "2000px",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div
          className={cn(
            "absolute w-80 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 -z-10 bg-radial from-black/50 to-transparent",
            currentPhase === "revealed" && "scale-125"
          )}
        />

        <div
          ref={containerRef}
          className={cn(
            "relative w-[320px] h-[400px] cursor-pointer transition-transform duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[22px]",
            sleeveClassName
          )}
          style={{
            perspective: "2000px",
            WebkitPerspective: "2000px",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) ${
              isHovered && currentPhase === "tucked" ? "translateY(-4px)" : "translateY(0)"
            }`,
          }}
          onClick={handleAction}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-expanded={currentPhase === "revealed"}
          aria-label={`${title} Dossier`}
        >
          <div
            className="absolute inset-0 rounded-[22px] shadow-2xl overflow-hidden border border-neutral-800/60 bg-gradient-to-b from-[#222328] to-[#16171a]"
            style={{
              boxShadow: isCardInForeground
                ? "0 35px 70px -15px rgba(0, 0, 0, 0.45)"
                : isHovered
                ? "0 30px 60px -12px rgba(0, 0, 0, 0.35)"
                : "0 20px 40px -10px rgba(0, 0, 0, 0.25)",
              transform: "translate3d(0, 0, 0px)",
              zIndex: 1,
              transition: "box-shadow 0.6s ease",
            }}
          >
            <div className="absolute top-0 inset-x-0 h-9 bg-gradient-to-b from-[#32343b] to-[#25262c] border-b border-black/40 shadow-sm flex items-center justify-between px-6 z-10">
              <div className="w-2 h-2 rounded-full bg-[#18191c] border border-white/20 shadow-inner" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                <span className="font-mono text-[9px] font-medium text-neutral-300 tracking-widest uppercase">
                  {badge}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#18191c] border border-white/20 shadow-inner" />
            </div>

            <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-r from-black/50 via-transparent to-black/30 pointer-events-none" />
          </div>

          <div
            onClick={handleAction}
            className={cn("absolute rounded-[18px]", cardClassName)}
            style={{
              width: "282px",
              height: "354px",
              left: "calc(50% - 141px)",
              top: "calc(50% - 177px)",
              transform: getCardTransform(),
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              willChange: "transform, box-shadow",
              zIndex: isCardInForeground ? 50 : 3,
              transition:
                currentPhase === "revealed"
                  ? "transform 0.65s cubic-bezier(0.34, 1.35, 0.64, 1), box-shadow 0.65s ease"
                  : currentPhase === "unflipping"
                  ? "transform 0.52s cubic-bezier(0.34, 1.25, 0.64, 1), box-shadow 0.52s ease"
                  : currentPhase === "aligning_side"
                  ? "transform 0.35s cubic-bezier(0.2, 0.85, 0.35, 1.15)"
                  : currentPhase === "extracting"
                  ? "transform 0.42s cubic-bezier(0.2, 0.85, 0.35, 1.15)"
                  : currentPhase === "landing"
                  ? "transform 0.38s cubic-bezier(0.2, 0.9, 0.35, 1.1)"
                  : currentPhase === "sliding_in"
                  ? "transform 0.42s cubic-bezier(0.2, 0.85, 0.35, 1.15)"
                  : "transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)",
              boxShadow: isCardInForeground
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 1px rgba(0,0,0,0.2)"
                : "0 2px 6px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              className={cn(
                "absolute -right-[22px] top-1/2 -translate-y-1/2 w-[22px] h-32 rounded-r-lg bg-[#fbfbf9] border-r border-y border-neutral-300 shadow-md flex flex-col items-center justify-center py-2 transition-all duration-300 pointer-events-none overflow-hidden",
                isCardInForeground ? "opacity-0" : "opacity-100"
              )}
            >
              <div className="w-1 h-3 bg-red-600 rounded-full mb-1 animate-pulse" />
              <span
                className="font-mono text-[8px] font-black text-red-600 tracking-[0.16em] uppercase select-none whitespace-nowrap"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                }}
              >
                DO NOT OPEN
              </span>
            </div>

            <div
              className="absolute inset-0 bg-[#fbfbf9] rounded-[18px] flex flex-col justify-between p-6 overflow-hidden border border-neutral-200/90 shadow-sm"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(0deg) translateZ(1px)",
                willChange: "transform",
              }}
            >
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-neutral-800 uppercase">
                    CLASSIFIED
                  </span>
                </div>
                <span className="font-mono text-[9px] font-semibold text-red-700 bg-red-100/80 border border-red-300 px-2 py-0.5 rounded tracking-widest uppercase">
                  RESTRICTED
                </span>
              </div>

              <div className="flex flex-col items-center justify-center my-auto text-center py-4">
                <div className="border-[2.5px] border-red-600/90 text-red-600 px-5 py-2.5 rounded font-mono font-black tracking-[0.24em] text-[15px] uppercase -rotate-3 shadow-xs bg-red-50/50">
                  DO NOT OPEN
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200/80 pt-3">
                <span className="font-mono text-[9px] text-neutral-400">{badge}</span>
                <span className="font-mono text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                  {currentPhase === "unflipping" ||
                  currentPhase === "aligning_side" ||
                  currentPhase === "sliding_in"
                    ? "SEALING"
                    : "OPEN"}
                </span>
              </div>
            </div>

            <div
              className="absolute inset-0 bg-[#fbfbf9] rounded-[18px] flex flex-col justify-between p-6 overflow-hidden border border-neutral-200/90 shadow-md"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg) translateZ(1px)",
                willChange: "transform",
              }}
            >
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse" />
                  <span className="font-mono text-[10px] font-semibold text-neutral-900 tracking-wider uppercase">
                    TOP SECRET
                  </span>
                </div>
                <span className="font-mono text-[9px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                  DECRYPTED
                </span>
              </div>

              <div className="space-y-2.5 text-left my-auto">
                <p className="font-sans text-[15px] font-medium text-neutral-900 leading-snug tracking-tight">
                  {message}
                </p>
                <p className="font-sans text-[13px] text-neutral-500 font-normal italic">
                  {punchline}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80">
                <span className="font-mono text-[9px] text-neutral-400 font-medium">
                  DOC {badge}
                </span>
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-neutral-200 shadow-sm shrink-0 bg-neutral-50 ring-2 ring-neutral-200 hover:scale-110 hover:rotate-6 transition-transform duration-300">
                  <img
                    src={stickerSrc}
                    alt="Octocat sticker"
                    className="w-full h-full object-cover block"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-[22px] select-none pointer-events-none flex flex-col justify-between p-6 text-white overflow-hidden border border-white/10 bg-gradient-to-b from-[#2e3036] to-[#1f2025]"
            style={{
              boxShadow:
                "inset 0px 1px 1px rgba(255, 255, 255, 0.2), 0 12px 30px -4px rgba(0, 0, 0, 0.35)",
              transform: "translate3d(0, 0, 8px)",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              zIndex: 10,
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none transition-transform duration-300"
              style={{
                transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)`,
              }}
            />

            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-24 bg-[#18191c] rounded-l-xl border-l border-y border-white/10 shadow-inner" />
            <div className="absolute top-0 inset-x-0 h-9 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            <div className="mt-3 text-neutral-200 flex items-center justify-start">
              {typeof logo === "string" ? (
                <div className="w-[32px] h-[32px] rounded-lg overflow-hidden border border-white/15 bg-neutral-950/85 shadow-sm p-1">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain filter brightness-110 drop-shadow-xs"
                  />
                </div>
              ) : (
                logo
              )}
            </div>

            <div className="space-y-0.5">
              <h3 className="font-mono text-[13.5px] font-semibold tracking-[0.1em] text-neutral-100 uppercase">
                {title}
              </h3>
              <p className="font-sans text-[12px] font-normal text-neutral-400">{subtitle}</p>
            </div>
          </div>
        </div>

        {currentPhase === "revealed" && (
          <button
            onClick={handleAction}
            className="mt-8 bg-neutral-900/95 hover:bg-black text-neutral-200 font-mono text-xs px-5 py-2 rounded-full border border-neutral-700/50 backdrop-blur transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5 animate-fadeIn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <span>↩</span> Close drawer
          </button>
        )}
      </div>
    );
  }
);

ConfidentialFolder.displayName = "ConfidentialFolder";

export default ConfidentialFolder;
