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
  category: string;
  title: string;
  description: string;
  paper: string;
  ink: string;
  image: string;
};

const IMG = "auto=format&fit=crop&w=1200&q=80";

const CARDS: Card[] = [
  {
    index: "01",
    category: "Fintech",
    title: "Boosted Conversion by 42% with a Product-Led Redesign",
    description:
      "We restructured the onboarding flow and clarified the value proposition, helping the platform turn more visitors into activated users.",
    paper: "oklch(0.94 0.028 75)",
    ink: "oklch(0.28 0.04 55)",
    image: `https://images.unsplash.com/photo-1615529328331-f8917597711f?${IMG}`,
  },
  {
    index: "02",
    category: "SaaS",
    title: "From Confusing to Clear: A Homepage That Actually Converts",
    description:
      "Through sharper messaging and a modular design system, the brand saw a measurable lift in demo requests within weeks.",
    paper: "oklch(0.94 0.022 220)",
    ink: "oklch(0.28 0.04 220)",
    image: `https://images.unsplash.com/photo-1589939705384-5185137a7f0f?${IMG}`,
  },
  {
    index: "03",
    category: "Startup",
    title: "Launched a New Brand That Closed Funding in 90 Days",
    description:
      "We built a high-trust visual identity and pitch narrative that helped the founders move faster with investors.",
    paper: "oklch(0.94 0.03 350)",
    ink: "oklch(0.28 0.05 350)",
    image: `https://images.unsplash.com/photo-1541123603104-512919d6a96c?${IMG}`,
  },
  {
    index: "04",
    category: "Brand strategy",
    title: "Repositioned the Brand for a Higher-Value Audience",
    description:
      "We refined the messaging and visual direction to attract more qualified leads and elevate perceived value.",
    paper: "oklch(0.94 0.025 145)",
    ink: "oklch(0.28 0.04 145)",
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
          className="grid h-auto w-full grid-cols-1 overflow-hidden rounded-[28px] p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] md:h-[500px] md:grid-cols-[minmax(0,1fr)_400px] md:gap-8 md:p-4"
          style={{
            backgroundColor: card.paper,
            color: card.ink,
            y: innerY,
            rotateX: innerRx,
            transformPerspective: 500,
            transformOrigin: "50% 100%",
          }}
        >
          <div className="flex min-w-0 flex-col justify-between gap-6 px-3 py-5 md:px-6 md:py-8">
            <p className="m-0 font-mono text-sm font-medium tabular-nums tracking-[0.08em] opacity-55">
              {card.index}
            </p>
            <div className="flex flex-col gap-3">
              <p className="m-0 text-[11px] font-medium uppercase tracking-[0.16em] opacity-60">
                {card.category}
              </p>
              <h2 className="m-0 max-w-[18ch] text-[clamp(1.4rem,2.4vw,2.35rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-balance">
                {card.title}
              </h2>
              <p className="m-0 max-w-[42ch] text-[0.98rem] leading-relaxed text-pretty opacity-75">
                {card.description}
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl outline outline-1 outline-black/10 md:aspect-auto md:h-full">
            <img
              src={card.image}
              alt=""
              width={800}
              height={600}
              draggable={false}
              className="pointer-events-none absolute inset-0 block size-full object-cover"
            />
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
      <section className="px-4 sm:px-5">
        <div ref={trackRef} className="relative h-[570vh]">
          <div className="sticky top-0 flex h-[100dvh] items-center justify-center [perspective:1200px]">
            <div
              className="relative w-full max-w-[1000px] [transform-style:preserve-3d]"
              style={{
                height: `calc(500px + ${PEEK * 3}px)`,
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
