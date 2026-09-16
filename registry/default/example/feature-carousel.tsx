"use client";

import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Pizza04Icon,
  CommandFreeIcons,
  GlobalSearchIcon,
  AiCloudIcon,
  SmartPhone01Icon,
  CheckmarkCircle01Icon,
  DashboardSquare01Icon,
  MagicWandIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";

const FEATURES = [
  {
    id: "sustainable",
    label: "Sustainable Sourcing",
    icon: Pizza04Icon,
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200",
    description: "Ethically sourced ingredients from local farmers.",
  },
  {
    id: "community",
    label: "Community Focused",
    icon: CommandFreeIcons,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200",
    description: "Building stronger bonds through shared experiences.",
  },
  {
    id: "global",
    label: "Global Reach",
    icon: GlobalSearchIcon,
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200",
    description: "Connecting visionaries across all continents.",
  },
  {
    id: "award",
    label: "Award Winning",
    icon: CheckmarkCircle01Icon,
    image:
      "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=1200",
    description: "Recognized excellence in design and innovation.",
  },
  {
    id: "cloud",
    label: "Cloud Ready",
    icon: AiCloudIcon,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
    description: "Scale your infrastructure with seamless ease.",
  },
  {
    id: "mobile",
    label: "Mobile First",
    icon: SmartPhone01Icon,
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200",
    description: "A world-class experience on every single device.",
  },
  {
    id: "analytics",
    label: "Real-time Analytics",
    icon: DashboardSquare01Icon,
    image:
      "https://images.unsplash.com/photo-1551288049-bbda38a10ad5?q=80&w=1200",
    description: "Insights at your fingertips, updated in real-time.",
  },
  {
    id: "security",
    label: "Enterprise Security",
    icon: CheckmarkCircle01Icon,
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
    description: "Bank-grade security protocols for your data.",
  },
  {
    id: "magic",
    label: "Magic Automations",
    icon: MagicWandIcon,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200",
    description: "Let AI handle the repetitive tasks for you.",
  },
  {
    id: "local",
    label: "Locally Owned",
    icon: CheckmarkCircle01Icon,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200",
    description: "Supporting local businesses and creators.",
  },
];

const AUTO_PLAY_INTERVAL = 3000;
const ITEM_HEIGHT = 65;

function shortestOffset(index: number, current: number, len: number) {
  let d = ((index - current) % len + len) % len;
  if (d > len / 2) d -= len;
  return d;
}

const chipSpring = { type: "spring" as const, duration: 0.45, bounce: 0 };
const cardSpring = { type: "spring" as const, duration: 0.4, bounce: 0 };

export default function FeatureCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const len = FEATURES.length;

  const currentIndex = ((step % len) + len) % len;

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    const delta = shortestOffset(index, currentIndex, len);
    if (delta !== 0) setStep((s) => s + delta);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index: number) => {
    const d = shortestOffset(index, currentIndex, len);
    if (d === 0) return "active";
    if (d === -1) return "prev";
    if (d === 1) return "next";
    return "hidden";
  };

  return (
    <div className="@container w-full max-w-7xl mx-auto md:p-8">
      <div className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[2.5rem] border border-border/40 @min-[720px]:aspect-video @min-[720px]:min-h-0 @min-[720px]:flex-row @min-[720px]:rounded-[4rem]">
        <div className="relative z-30 flex h-[280px] w-full shrink-0 flex-col items-start justify-center overflow-hidden bg-[#62B2FE] px-8 @min-[720px]:h-auto @min-[720px]:w-[40%] @min-[720px]:min-h-0 @min-[720px]:px-16 @min-[720px]:pl-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-12 bg-gradient-to-b from-[#62B2FE] via-[#62B2FE]/80 to-transparent @min-[720px]:h-16" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-12 bg-gradient-to-t from-[#62B2FE] via-[#62B2FE]/80 to-transparent @min-[720px]:h-16" />
          <div className="relative z-20 flex h-full w-full items-center justify-center @min-[720px]:justify-start">
            {FEATURES.map((feature, index) => (
              <FeatureChip
                key={feature.id}
                feature={feature}
                index={index}
                currentIndex={currentIndex}
                total={len}
                reduceMotion={!!reduceMotion}
                onSelect={() => handleChipClick(index)}
                onPause={() => setIsPaused(true)}
                onResume={() => setIsPaused(false)}
              />
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[420px] flex-1 items-center justify-center overflow-hidden border-t border-border/20 bg-secondary/30 px-6 py-12 @min-[720px]:min-h-0 @min-[720px]:border-t-0 @min-[720px]:border-l @min-[720px]:px-10 @min-[720px]:py-16">
          <div className="relative flex aspect-[4/5] w-full max-w-[420px] items-center justify-center">
            {FEATURES.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={reduceMotion ? { duration: 0 } : cardSpring}
                  className="absolute inset-0 origin-center overflow-hidden rounded-[2rem] border-4 border-background bg-background md:rounded-[2.8rem] md:border-8"
                >
                  <img
                    src={feature.image}
                    alt={feature.label}
                    width={1200}
                    height={1500}
                    className={cn(
                      "block size-full object-cover transition-[filter] duration-150 ease-out",
                      isActive
                        ? "grayscale-0 blur-0"
                        : "grayscale blur-[2px] brightness-75"
                    )}
                  />

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, y: 12 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { duration: 0.2, ease: [0.32, 0.72, 0, 1] }
                        }
                        className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 pt-32"
                      >
                        <div className="mb-3 w-fit rounded-full border border-border/50 bg-background px-4 py-1.5 text-[11px] font-normal uppercase tracking-[0.2em] text-foreground shadow-lg">
                          {index + 1} • {feature.label}
                        </div>
                        <p className="text-xl font-normal leading-tight tracking-tight text-white drop-shadow-md md:text-2xl">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className={cn(
                      "absolute top-8 left-8 flex items-center gap-3 transition-opacity duration-150 ease-out",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                    <span className="font-mono text-[10px] font-normal uppercase tracking-[0.3em] text-white/80">
                      Live Session
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureChip({
  feature,
  index,
  currentIndex,
  total,
  reduceMotion,
  onSelect,
  onPause,
  onResume,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  currentIndex: number;
  total: number;
  reduceMotion: boolean;
  onSelect: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const offset = shortestOffset(index, currentIndex, total);
  const prevOffset = useRef(offset);
  const jumped = Math.abs(offset - prevOffset.current) > 1;

  useLayoutEffect(() => {
    prevOffset.current = offset;
  }, [offset]);

  const isActive = offset === 0;

  return (
    <motion.div
      initial={false}
      style={{ height: ITEM_HEIGHT, width: "fit-content" }}
      animate={{
        y: offset * ITEM_HEIGHT,
        opacity: Math.max(0, 1 - Math.abs(offset) * 0.25),
      }}
      transition={reduceMotion || jumped ? { duration: 0 } : chipSpring}
      className="absolute flex items-center justify-start"
    >
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={onPause}
        onMouseLeave={onResume}
        className={cn(
          "relative flex cursor-pointer items-center gap-4 rounded-full border px-6 py-3.5 text-left transition-[color,background-color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none md:px-10 md:py-5 @min-[720px]:px-8 @min-[720px]:py-4",
          isActive
            ? "z-10 border-white bg-white text-[#62B2FE]"
            : "border-white/20 bg-transparent text-white/60 hover:border-white/40 hover:text-white"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center",
            isActive ? "text-[#62B2FE]" : "text-white/40"
          )}
        >
          <HugeiconsIcon icon={feature.icon} size={18} strokeWidth={2} />
        </div>
        <span className="whitespace-nowrap text-sm font-normal tracking-tight uppercase md:text-[15px]">
          {feature.label}
        </span>
      </button>
    </motion.div>
  );
}
