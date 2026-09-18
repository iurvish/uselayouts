"use client";

import React, { useRef, type RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export type SplitCard = {
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
};

export type ScrollSplitCardsProps = {
  items?: SplitCard[];
  imageSrc?: string;
  className?: string;
  /** Scrollport to track. Omit to follow the page. */
  containerRef?: RefObject<HTMLElement | null>;
};

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2400&auto=format&fit=crop";

export const DEFAULT_CARDS: SplitCard[] = [
  {
    title: "Capture",
    description: "One frame, shot wide. The still holds until you start scrolling.",
    bgColor: "#ece7df",
    textColor: "#1a1714",
  },
  {
    title: "Cut",
    description: "The photograph splits into three panels and steps apart.",
    bgColor: "#2f4f6f",
    textColor: "#f4f0e8",
  },
  {
    title: "Flip",
    description: "Each panel turns. Title and copy sit on the back.",
    bgColor: "#161412",
    textColor: "#f4f0e8",
  },
];

export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function remap(progress: number, from: number, to: number) {
  if (to === from) return progress >= to ? 1 : 0;
  return clamp01((progress - from) / (to - from));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Left/right panels peak at `peak` px, then close in a little for the flip. */
export function panelShiftX(progress: number, index: number, peak = 48) {
  const dir = index === 0 ? -1 : index === 2 ? 1 : 0;
  const out = remap(progress, 0, 0.4);
  const settle = remap(progress, 0.4, 0.8);
  return dir * lerp(0, peak, out) * (1 - settle * 0.5) || 0;
}

export function panelRotateY(progress: number) {
  return lerp(0, 180, remap(progress, 0.4, 0.8));
}

export function panelScale(progress: number) {
  return lerp(1, 0.92, remap(progress, 0, 0.4));
}

export function panelRadius(progress: number, index: number) {
  const inner = lerp(0, 16, remap(progress, 0, 0.2));
  if (index === 0) return `16px ${inner}px ${inner}px 16px`;
  if (index === 2) return `${inner}px 16px 16px ${inner}px`;
  return `${inner}px`;
}

function Panel({
  card,
  index,
  progress,
  imageSrc,
}: {
  card: SplitCard;
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  imageSrc: string;
}) {
  const x = useTransform(progress, (p) => panelShiftX(p, index));
  const rotateY = useTransform(progress, panelRotateY);
  const radius = useTransform(progress, (p) => panelRadius(p, index));

  return (
    <motion.div
      className={`relative h-full min-w-0 flex-[1_1_0] [transform-style:preserve-3d] ${
        index > 0 ? "-ml-px" : ""
      }`}
      style={{ x, rotateY, zIndex: index }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
        style={{ borderRadius: radius }}
      >
        <div
          className="absolute inset-0 h-full w-[300%]"
          style={{
            left: `${-100 * index}%`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col justify-end overflow-hidden p-6 [backface-visibility:hidden] sm:p-8"
        style={{
          backgroundColor: card.bgColor,
          color: card.textColor,
          borderRadius: radius,
          transform: "rotateY(180deg)",
        }}
      >
        <h3 className="text-[22px] font-semibold leading-tight tracking-tight sm:text-[26px]">
          {card.title}
        </h3>
        <p className="mt-2 max-w-[18em] text-sm leading-relaxed opacity-80">
          {card.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function ScrollSplitCards({
  items = DEFAULT_CARDS,
  imageSrc = DEFAULT_IMAGE,
  className = "",
  containerRef,
}: ScrollSplitCardsProps) {
  const cards = items.slice(0, 3);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    ...(containerRef ? { container: containerRef } : {}),
    offset: ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, panelScale);
  const lift = useTransform(scrollYProgress, (p) => lerp(0, -72, remap(p, 0.85, 1)));

  return (
    <div
      ref={trackRef}
      className={`relative h-[400vh] w-full bg-neutral-950 ${className}`}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden [perspective:1400px]">
        <motion.div
          className="flex h-[min(420px,56vh)] w-full max-w-4xl px-4 [transform-style:preserve-3d]"
          style={{ scale, y: lift }}
        >
          {cards.map((card, index) => (
            <Panel
              key={card.title}
              card={card}
              index={index}
              progress={scrollYProgress}
              imageSrc={imageSrc}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ScrollSplitCards;
