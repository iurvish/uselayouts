"use client";

import React, { useLayoutEffect, useRef, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

/** Piecewise linear mix. Stops may sit outside 0–1; we don't clamp them into WAAPI offsets. */
export function mix(progress: number, stops: number[], values: number[]) {
  if (progress <= stops[0]) return values[0];
  for (let i = 1; i < stops.length; i++) {
    if (progress <= stops[i]) {
      const span = stops[i] - stops[i - 1];
      const t = span === 0 ? 1 : (progress - stops[i - 1]) / span;
      return values[i - 1] + (values[i] - values[i - 1]) * t;
    }
  }
  return values[values.length - 1];
}

export interface CardItem {
  id: string | number;
  tag: string;
  title: string;
  description: string;
  badge?: string;
  accentColor: string; // e.g. '#ff6b4a', 'rgb(167, 139, 255)'
  bgGradient?: string;
  backgroundColor?: string;
}

export interface Scroll3DCardStackProps {
  items?: CardItem[];
  className?: string;
  /** Scrollport to track. Omit to follow the page. */
  containerRef?: RefObject<HTMLElement | null>;
}

const DEFAULT_CARDS: CardItem[] = [
  {
    id: 1,
    tag: "Foundation",
    title: "Design Systems",
    description:
      "Build consistent, scalable interfaces with reusable components and shared design tokens across your entire product.",
    accentColor: "rgb(255, 107, 74)",
    backgroundColor: "rgb(10, 10, 10)",
  },
  {
    id: 2,
    tag: "Animation",
    title: "Motion Design",
    description:
      "Craft scroll-linked animations that respond to every user interaction with cinematic precision and spring physics.",
    accentColor: "rgb(167, 139, 255)",
    backgroundColor: "rgb(26, 18, 53)",
  },
  {
    id: 3,
    tag: "Engineering",
    title: "Performance",
    description:
      "GPU-accelerated transforms, zero layout shift, and buttery-smooth 60fps across every device and browser.",
    accentColor: "rgb(74, 219, 255)",
    backgroundColor: "rgb(12, 35, 64)",
  },
  {
    id: 4,
    tag: "Inclusive",
    title: "Accessibility",
    description:
      "WCAG-compliant, keyboard navigable, and fully readable by every browser, search engine, and assistive tool.",
    accentColor: "rgb(125, 255, 138)",
    backgroundColor: "rgb(14, 36, 24)",
  },
];

interface CardProps {
  card: CardItem;
  index: number;
  totalCards: number;
  progress: MotionValue<number>;
}

const Card: React.FC<CardProps> = ({ card, index, totalCards, progress }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const step = 1 / (totalCards - 1 || 1);
  const at = index * step;

  // ponytail: write styles by hand so Motion never calls element.animate()
  // (nested preview scroll + filter/transform keyframes crash Chrome WAAPI)
  useLayoutEffect(() => {
    const yStops = [at - step, at, at + step * 0.5, at + step];
    const paint = (p: number) => {
      const el = cardRef.current;
      if (!el) return;
      const y = mix(p, yStops, [50, 0, -120, -320]);
      const z = mix(p, yStops, [-150, 0, 80, 140]);
      const rx = mix(p, [at, at + step * 0.6, at + step], [0, -25, -64]);
      const s = mix(p, yStops, [0.9, 1, 0.96, 0.92]);
      const op = mix(
        p,
        [at - step, at - step * 0.3, at + step * 0.5, at + step * 0.9],
        [0.4, 1, 0.9, 0],
      );
      const blur = mix(p, [at, at + step * 0.5, at + step], [0, 2, 9]);
      const accent = mix(p, [at - step * 0.5, at, at + step * 0.5], [0, 1, 0]);
      el.style.transform = `translateY(${y}px) translateZ(${z}px) rotateX(${rx}deg) scale(${s})`;
      el.style.opacity = String(op);
      el.style.filter = `blur(${blur}px)`;
      if (accentRef.current) accentRef.current.style.opacity = String(accent);
      if (barRef.current) barRef.current.style.opacity = String(accent);
    };
    paint(progress.get());
    return progress.on("change", paint);
  }, [progress, at, step]);

  const formattedIndex = String(index + 1).padStart(2, "0");
  const formattedTotal = String(totalCards).padStart(2, "0");

  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: card.backgroundColor || "rgb(10, 10, 10)",
        zIndex: totalCards - index,
      }}
      className="absolute top-0 left-0 w-full h-full rounded-[28px] p-7 sm:p-10 md:p-12 flex flex-col justify-between box-border origin-[50%_100%] [transform-style:preserve-3d] [backface-visibility:hidden] will-change-transform overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.45)] border border-white/10 bg-gradient-to-b from-white/[0.14] via-transparent to-transparent"
    >
      {/* Top Header: Counter & Pill Tag */}
      <div className="flex justify-between items-start z-10">
        <div className="flex items-baseline gap-2 font-mono text-[11px] font-medium tracking-[0.14em]">
          <span className="text-white/95">{formattedIndex}</span>
          <span className="text-white/25">—</span>
          <span className="text-white/45">{formattedTotal}</span>
        </div>

        <span className="text-[10px] font-semibold text-white/95 bg-white/10 px-3.5 py-1.5 rounded-full tracking-[0.12em] uppercase backdrop-blur-md border border-white/10 shadow-sm">
          {card.tag}
        </span>
      </div>

      {/* Top Accent Dot */}
      <div
        ref={accentRef}
        style={{
          backgroundColor: card.accentColor,
          boxShadow: `0 0 20px ${card.accentColor}, 0 0 8px ${card.accentColor}`,
        }}
        className="absolute top-8 sm:top-10 md:top-12 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
      />

      {/* Card Body: Title & Description */}
      <div className="relative z-10 space-y-3 sm:space-y-4">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/95 tracking-tight leading-[1.08]">
          {card.title}
        </h3>
        <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-[92%] font-normal">
          {card.description}
        </p>
      </div>

      {/* Bottom Accent Bar */}
      <div
        ref={barRef}
        style={{
          backgroundColor: card.accentColor,
          boxShadow: `0 0 14px ${card.accentColor}`,
        }}
        className="w-10 h-0.5 rounded-full pointer-events-none"
      />
    </div>
  );
};

function StackDot({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const step = 1 / (total - 1 || 1);
  const target = index * step;

  useLayoutEffect(() => {
    const stops = [target - step * 0.5, target, target + step * 0.5];
    const paint = (p: number) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `scale(${mix(p, stops, [0.9, 2.2, 0.9])})`;
      el.style.opacity = String(mix(p, stops, [0.3, 0.95, 0.3]));
    };
    paint(progress.get());
    return progress.on("change", paint);
  }, [progress, target, step]);

  return <div ref={ref} className="h-1 w-1 rounded-full bg-white" />;
}

export const Scroll3DCardStack: React.FC<Scroll3DCardStackProps> = ({
  items = DEFAULT_CARDS,
  className = "",
  containerRef,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useMotionValue(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const scroller = containerRef?.current ?? null;

    const update = () => {
      const viewH = scroller ? scroller.clientHeight : window.innerHeight;
      const rect = track.getBoundingClientRect();
      const parentTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const range = rect.height - viewH;
      const p = range <= 0 ? 0 : -(rect.top - parentTop) / range;
      scrollYProgress.set(Math.min(1, Math.max(0, p)));
    };

    const node: EventTarget = scroller ?? window;
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      node.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [containerRef, scrollYProgress]);

  return (
    <div
      ref={trackRef}
      style={{ height: `${items.length * 100}vh` }}
      className={`relative w-full bg-black ${className}`}
    >
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center [perspective:1600px] overflow-hidden bg-black">
        {/* Dynamic Ambient Background Glow */}
        <div className="absolute inset-[-20%] bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,255,0.18)_0%,transparent_55%)] pointer-events-none z-0 blur-[60px]" />

        {/* 3D Card Stack Container */}
        <div className="relative w-[90vw] max-w-[520px] h-[340px] sm:h-[360px] [transform-style:preserve-3d] z-10">
          {items.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              totalCards={items.length}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Right-side Step Progress Indicators */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3.5 z-20 pointer-events-none">
          {items.map((_, index) => (
            <StackDot
              key={index}
              index={index}
              total={items.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scroll3DCardStack;
