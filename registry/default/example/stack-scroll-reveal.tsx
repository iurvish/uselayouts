"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Lenis from "lenis";

type Card = {
  index: string;
  title: string;
  description: string;
  image: string;
};

const IMG = "auto=format&fit=crop&w=1200&q=80";

const CARDS: Card[] = [
  {
    index: "01",
    title: "Thrown forms, quiet finishes",
    description:
      "Hand-built ceramics that reward a slow look — soft glaze, honest weight, and surfaces that feel made rather than manufactured.",
    image: `https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?${IMG}`,
  },
  {
    index: "02",
    title: "Light through linen and clay",
    description:
      "A studio catalog built around texture and restraint, where each frame leaves room for the object to breathe.",
    image: `https://images.unsplash.com/photo-1589939705384-5185137a7f0f?${IMG}`,
  },
  {
    index: "03",
    title: "Objects with a longer memory",
    description:
      "Pieces shaped to outlast trends — matte stoneware, warm ash glaze, and forms that settle into daily use.",
    image: `https://images.unsplash.com/photo-1541123603104-512919d6a96c?${IMG}`,
  },
  {
    index: "04",
    title: "A shelf worth returning to",
    description:
      "Curated vessels and tableware arranged like a small exhibition — tactile, calm, and easy to browse.",
    image: `https://images.unsplash.com/photo-1513519245088-0e12902e5a38?${IMG}`,
  },
];

const PEEL_Y_DESKTOP = -736;
const PEEL_Y_MOBILE = -520;
const PEEL_RX = 15;
const PEEK = 18;
const REST_Y = [0, PEEK, PEEK * 2, PEEK * 3] as const;
const REST_SCALE = [1, 0.96, 0.93, 0.9] as const;
const WINDOWS = [
  { peel: [0.08, 0.3] },
  { peel: [0.35, 0.55] },
  { peel: [0.6, 0.8] },
  { peel: [0.85, 1.0] },
] as const;

function StackCard({
  card,
  index,
  progress,
  peelY,
  reduceMotion,
}: {
  card: Card;
  index: number;
  progress: MotionValue<number>;
  peelY: number;
  reduceMotion: boolean;
}) {
  const { peel } = WINDOWS[index];
  const restY = REST_Y[index];
  const restScale = REST_SCALE[index];

  const wrapY = useTransform(
    progress,
    [0, peel[0], peel[0] + 0.02, peel[1], 1],
    [restY, restY, 0, 0, 0],
  );
  const wrapScale = useTransform(
    progress,
    [0, peel[0], peel[0] + 0.02, peel[1], 1],
    [restScale, restScale, 1, 1, 1],
  );
  const innerY = useTransform(
    progress,
    [0, peel[0], peel[1], 1],
    reduceMotion ? [0, 0, 0, 0] : [0, 0, peelY, peelY],
  );
  const innerRx = useTransform(
    progress,
    [0, peel[0], peel[1], 1],
    reduceMotion ? [0, 0, 0, 0] : [0, 0, PEEL_RX, PEEL_RX],
  );

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 w-full"
      style={{ zIndex: CARDS.length - index }}
    >
      <motion.div
        className="pointer-events-auto w-full will-change-transform"
        style={{ y: wrapY, scale: wrapScale, transformOrigin: "50% 100%" }}
      >
        <motion.article
          className="relative h-[min(72dvh,520px)] w-full overflow-hidden rounded-[28px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_50px_-24px_rgba(0,0,0,0.55)]"
          style={{
            y: innerY,
            rotateX: innerRx,
            transformPerspective: 500,
            transformOrigin: "50% 100%",
          }}
        >
          <img
            src={card.image}
            alt=""
            width={1200}
            height={800}
            draggable={false}
            className="pointer-events-none absolute inset-0 block size-full object-cover"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/10"
            aria-hidden
          />
          <div className="relative flex h-full flex-col justify-between p-8 text-white md:p-10">
            <p className="m-0 font-mono text-lg font-medium tabular-nums tracking-[0.06em]">
              {card.index}
            </p>
            <div className="flex max-w-[34rem] flex-col gap-3">
              <h2 className="m-0 text-[clamp(1.5rem,3.2vw,2.35rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-balance">
                {card.title}
              </h2>
              <p className="m-0 text-[0.98rem] leading-relaxed text-pretty text-white/78">
                {card.description}
              </p>
            </div>
          </div>
        </motion.article>
      </motion.div>
    </div>
  );
}

export default function StackScrollReveal() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [peelY, setPeelY] = useState(PEEL_Y_DESKTOP);
  const reduceMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
    });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduceMotion]);

  useEffect(() => {
    const update = () => {
      setPeelY(window.innerWidth < 768 ? PEEL_Y_MOBILE : PEEL_Y_DESKTOP);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="bg-[oklch(0.97_0.008_85)] font-sans text-[oklch(0.28_0.03_75)] antialiased">
      <div className="h-[400px]" aria-hidden />
      <section className="px-4 sm:px-5">
        <div ref={trackRef} className="relative h-[570vh]">
          <div className="sticky top-0 flex h-[100dvh] items-center justify-center [perspective:1200px]">
            <div
              className="relative w-full max-w-[1000px] [transform-style:preserve-3d]"
              style={{
                height: `calc(min(72dvh, 520px) + ${PEEK * 3}px)`,
                maxHeight: `calc(78dvh + ${PEEK * 3}px)`,
              }}
            >
              {CARDS.map((card, i) => (
                <StackCard
                  key={card.index}
                  card={card}
                  index={i}
                  progress={scrollYProgress}
                  peelY={peelY}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-h-[50vh] place-content-center px-4 pb-24 pt-10 text-center sm:min-h-[60vh]">
        <p className="m-0 text-[clamp(1.5rem,4vw,3rem)] font-medium tracking-[-0.05em]">
          THE END
        </p>
      </section>
    </div>
  );
}
