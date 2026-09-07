"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";

export type EditorialDeckCard = {
  id: string;
  date: string;
  title: string;
  image: string;
  tint: string;
};

export const DEFAULT_CARDS: EditorialDeckCard[] = [
  {
    id: "ambient",
    date: "Published recently",
    title: "The rise of ambient computing",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    tint: "#C9DFF5",
  },
  {
    id: "human",
    date: "Published 4 days ago",
    title: "Designing AI interfaces that feel human",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80",
    tint: "#C8EBD8",
  },
  {
    id: "workflows",
    date: "Published recently",
    title: "Creative workflows powered by soft tools",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tint: "#F2D4E4",
  },
  {
    id: "systems",
    date: "Published recently",
    title: "Minimal design systems for fast teams",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tint: "#F7E0C8",
  },
  {
    id: "intersect",
    date: "Published recently",
    title: "Where intelligence meets calm product craft",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    tint: "#DDD4F2",
  },
];

const STACK_Y = 12;
const STACK_SCALE = 0.04;
const SWIPE = 90;
const SETTLE = {
  type: "spring" as const,
  stiffness: 460,
  damping: 34,
  mass: 0.9,
};

function rotateOrder(prev: number[], from: number) {
  return [...prev.slice(from), ...prev.slice(0, from)];
}

export interface EditorialDeckProps {
  cards?: EditorialDeckCard[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function EditorialDeck({
  cards = DEFAULT_CARDS,
  title = "Editorial deck",
  subtitle = "Drag to flip through stories",
  className = "",
}: EditorialDeckProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [fly, setFly] = useState(false);
  const flying = useRef(false);
  const flyStarted = useRef(0);

  const lastDepth = cards.length - 1;
  const showIntro = Boolean(title || subtitle);

  const commitBack = () => {
    if (!flying.current) return;
    if (Date.now() - flyStarted.current < 200) return;
    flying.current = false;
    setOrder((prev) => rotateOrder(prev, 1));
    setFly(false);
  };

  const sendToBack = () => {
    if (flying.current) return;
    if (reduceMotion) {
      setOrder((prev) => rotateOrder(prev, 1));
      return;
    }
    flying.current = true;
    flyStarted.current = Date.now();
    setFly(true);
    window.setTimeout(commitBack, 360);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE || info.velocity.x < -450) sendToBack();
    else if (info.offset.x > SWIPE || info.velocity.x > 450) sendToBack();
  };

  return (
    <section
      className={`flex w-full flex-col items-center justify-center bg-[#F7F4F0] px-4 py-12 ${className}`}
    >
      {showIntro ? (
        <div className="mb-8 text-center">
          {title ? (
            <p className="text-sm font-medium tracking-[0.08em] text-neutral-500">
              {title}
            </p>
          ) : null}
          {subtitle ? (
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              {subtitle}
            </h2>
          ) : null}
        </div>
      ) : null}

      <div
        className="relative w-full max-w-3xl"
        style={{ perspective: 1400, height: "min(32rem, 65vh)" }}
      >
        {order
          .slice()
          .reverse()
          .map((cardIndex, revI) => {
            const restDepth = lastDepth - revI;
            const isFront = restDepth === 0;
            const isFlying = isFront && fly;
            const depth = isFlying ? lastDepth : fly && restDepth > 0 ? restDepth - 1 : restDepth;
            const c = cards[cardIndex]!;
            const canDrag = isFront && !fly;

            return (
              <motion.article
                key={c.id}
                drag={canDrag ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.16}
                whileDrag={{ scale: 0.97 }}
                onDragEnd={canDrag ? onDragEnd : undefined}
                initial={false}
                animate={{
                  x: 0,
                  y: depth * STACK_Y,
                  scale: 1 - depth * STACK_SCALE,
                }}
                transition={SETTLE}
                onAnimationComplete={() => {
                  if (isFlying) commitBack();
                }}
                className={`absolute inset-0 flex flex-col touch-none overflow-hidden rounded-[1.5rem] ring-1 ring-inset ring-black/5 md:flex-row ${
                  canDrag
                    ? "cursor-grab active:cursor-grabbing"
                    : "pointer-events-none"
                }`}
                style={{
                  zIndex: isFlying ? 1 : 20 - depth,
                  transition: isFlying ? "z-index 0s linear 0.12s" : undefined,
                  backgroundColor: c.tint,
                  boxShadow: isFront
                    ? "0 8px 24px -12px rgba(0,0,0,0.14), 0 2px 6px -2px rgba(0,0,0,0.05)"
                    : "0 2px 8px -6px rgba(0,0,0,0.08)",
                }}
              >
                <div className="relative h-48 w-full shrink-0 p-4 md:h-auto md:w-[46%] md:p-5">
                  <div className="h-full overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image}
                      alt={c.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-3 border-t border-black/10 px-7 py-7 md:border-l md:border-t-0 md:px-10 md:py-10">
                  <p className="text-[13px] font-medium tracking-[0.06em] text-neutral-500">
                    {c.date}
                  </p>
                  <h3 className="text-2xl font-semibold leading-snug tracking-tight text-neutral-900 sm:text-[1.85rem]">
                    {c.title}
                  </h3>
                </div>
              </motion.article>
            );
          })}
      </div>

      <div className="mt-8 flex items-center gap-2">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Go to card ${i + 1}`}
            onClick={() => {
              if (flying.current) return;
              const pos = order.indexOf(i);
              if (pos <= 0) return;
              setOrder((prev) => rotateOrder(prev, pos));
            }}
            className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
              order[0] === i ? "w-6 bg-neutral-900" : "w-2 bg-neutral-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default EditorialDeck;
