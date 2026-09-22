"use client";

import React, { useRef, type RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export type SplitCard = {
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  kicker?: string;
};

export type ScrollSplitCardsProps = {
  items?: SplitCard[];
  imageSrc?: string;
  className?: string;
  /** Scrollport to track. Omit to follow the page. */
  containerRef?: RefObject<HTMLElement | null>;
};

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1759340642551-f7b6059fe2ba?q=80&w=2400&auto=format&fit=crop";

export const DEFAULT_CARDS: SplitCard[] = [
  {
    title: "Fort Point",
    kicker: "Presidio",
    description:
      "A Civil War battery under the south tower. The fog hits the brick before it hits the city.",
    bgColor: "#ead9c4",
    textColor: "#2a1810",
  },
  {
    title: "The Span",
    kicker: "1.7 miles",
    description:
      "International Orange, mixed to cut through fog. The deck hangs 220 feet over the strait.",
    bgColor: "#c4452d",
    textColor: "#fff4ec",
  },
  {
    title: "Marin Head",
    kicker: "North tower",
    description:
      "The walk from Battery Spencer. On a thick day the city is only a smear of lights.",
    bgColor: "#2c3033",
    textColor: "#e6e2da",
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
        className="absolute inset-0 flex flex-col justify-between overflow-hidden p-5 antialiased [backface-visibility:hidden] sm:p-6"
        style={{
          backgroundColor: card.bgColor,
          color: card.textColor,
          borderRadius: radius,
          transform: "rotateY(180deg)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
        }}
      >
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] tabular-nums opacity-55">
          <span>{String(index + 1).padStart(2, "0")}</span>
          {card.kicker ? <span className="truncate">{card.kicker}</span> : null}
        </div>
        <div>
          <div
            className="mb-4 h-px w-7 opacity-50"
            style={{ backgroundColor: "currentColor" }}
          />
          <h3 className="text-[22px] font-semibold leading-[1.12] tracking-tight text-balance sm:text-[26px]">
            {card.title}
          </h3>
          <p className="mt-2.5 text-[13px] leading-relaxed text-pretty opacity-80 sm:text-sm">
            {card.description}
          </p>
        </div>
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
