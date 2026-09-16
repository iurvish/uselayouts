"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
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
  color: string;
  image: string;
};

const CARDS: Card[] = [
  {
    index: "01",
    category: "FINTECH",
    title: "Boosted Conversion by 42% with a Product-Led Redesign",
    description:
      "We restructured the onboarding flow and clarified the value proposition, helping the platform turn more visitors into activated users.",
    color: "rgb(161, 75, 0)",
    image: "/assets/utFiAaCwhnv00yrJoMjGBFBuY-aHR0cHM6.webp",
  },
  {
    index: "02",
    category: "SAAS",
    title: "From Confusing to Clear: A Homepage That Actually Converts",
    description:
      "Through sharper messaging and a modular design system, the brand saw a measurable lift in demo requests within weeks.",
    color: "rgb(0, 131, 161)",
    image: "/assets/HpVtJvTtGYBJgExTS8JwgnQaFW0-aHR0cHM6.webp",
  },
  {
    index: "03",
    category: "STARTUP",
    title: "Launched a New Brand That Closed Funding in 90 Days",
    description:
      "We built a high-trust visual identity and pitch narrative that helped the founders move faster with investors.",
    color: "rgb(161, 0, 96)",
    image: "/assets/KdUSFs9N1QPjwkfLd2sNVoqe5gg-aHR0cHM6.webp",
  },
  {
    index: "04",
    category: "BRAND STRATEGY",
    title: "Repositioned the Brand for a Higher-Value Audience",
    description:
      "We refined the messaging and visual direction to attract more qualified leads and elevate perceived value.",
    color: "rgb(70, 0, 161)",
    image: "/assets/icMs2n9l8tFhK7b1LuAEXfouBs-aHR0cHM6.webp",
  },
];

const PEEL_Y_DESKTOP = -736;
const PEEL_Y_MOBILE = -520;
const PEEL_RX = 15;

/** Equal peek under the front card — matches Framer (~18px each layer) */
const PEEK = 18;
const REST_Y = [0, PEEK, PEEK * 2, PEEK * 3] as const;

/**
 * Subtle behind-card scale (Framer uses ~0.88/0.76/0.64 — too strong here).
 * Keep a light step so peeks read as a stack without shrinking hard.
 */
const REST_SCALE = [1, 0.96, 0.93, 0.90] as const;

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
}: {
  card: Card;
  index: number;
  progress: MotionValue<number>;
  peelY: number;
}) {
  const { peel } = WINDOWS[index];
  const restY = REST_Y[index];
  const restScale = REST_SCALE[index];

  // Keep peek + scale until THIS card becomes front, then settle to full size
  const wrapY = useTransform(
    progress,
    [0, peel[0], peel[0] + 0.02, peel[1], 1],
    [restY, restY, 0, 0, 0]
  );
  const wrapScale = useTransform(
    progress,
    [0, peel[0], peel[0] + 0.02, peel[1], 1],
    [restScale, restScale, 1, 1, 1]
  );
  const innerY = useTransform(
    progress,
    [0, peel[0], peel[1], 1],
    [0, 0, peelY, peelY]
  );
  const innerRx = useTransform(
    progress,
    [0, peel[0], peel[1], 1],
    [0, 0, PEEL_RX, PEEL_RX]
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
          className="grid h-auto w-full grid-cols-1 gap-3 overflow-hidden rounded-[24px] p-[10px] text-white md:h-[500px] md:grid-cols-[1fr_408px] md:gap-0 md:py-[10px] md:pl-9 md:pr-[10px]"
          style={{
            backgroundColor: card.color,
            y: innerY,
            rotateX: innerRx,
            transformPerspective: 500,
            transformOrigin: "50% 100%",
          }}
        >
          <div className="flex min-w-0 flex-col gap-4 px-2 pb-2 pt-4 md:gap-6 md:px-0 md:pb-0 md:pr-12 md:pt-9">
            <p className="m-0 text-xl font-semibold uppercase leading-none md:text-[2rem]">
              {card.index}
            </p>
            <div className="flex flex-col gap-2 md:gap-3">
              <p className="m-0 text-xs font-semibold uppercase leading-5 opacity-75 md:text-base">
                {card.category}
              </p>
              <h2 className="m-0 text-[clamp(1.35rem,2.8vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.03em]">
                {card.title}
              </h2>
            </div>
            <p className="m-0 text-[clamp(0.95rem,1.2vw,1.18rem)] leading-normal">
              {card.description}
            </p>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-black/10 md:aspect-auto md:h-full md:w-[408px] md:shrink-0">
            <img
              src={card.image}
              alt=""
              className="absolute inset-0 block h-full w-full object-cover"
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
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Lenis — same smooth/slowed scroll feel as the Framer site
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const update = () => {
      setPeelY(window.innerWidth < 768 ? PEEL_Y_MOBILE : PEEL_Y_DESKTOP);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="bg-white font-sans text-[rgb(46,46,46)] antialiased">
      <section className="grid min-h-[40vh] place-items-center bg-gradient-to-b from-[#dbe7ff] to-[#f7f7f7] px-4 py-8 sm:min-h-[50vh] sm:px-5 sm:py-10">
        <p className="m-0 inline-flex items-center gap-2 text-[clamp(1.15rem,3.5vw,3rem)] font-medium leading-tight tracking-[-0.05em] sm:gap-3">
          <span aria-hidden>↓</span>
          <span>Scroll Down</span>
          <span aria-hidden>↓</span>
        </p>
      </section>

      <section className="bg-[#f7f7f7] px-4 sm:px-5">
        <h1 className="mx-auto max-w-[800px] px-1 pb-8 pt-12 text-center text-[clamp(1.6rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.04em] text-[rgb(161,75,0)] sm:pb-12 sm:pt-20">
          How We Deliver Measurable Outcomes
        </h1>

        <div ref={trackRef} className="relative h-[570vh]">
          {/* overflow visible so teal/pink/purple peeks aren't clipped */}
          <div className="sticky top-0 flex h-[100dvh] items-center justify-center [perspective:1200px]">
            <div
              className="relative w-full max-w-[1000px] [transform-style:preserve-3d]"
              style={{
                // Fixed card height + room so teal / pink / purple peeks stay visible
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
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-h-[50vh] place-content-center justify-items-center gap-3 bg-[#f7f7f7] px-4 pb-20 pt-10 text-center sm:min-h-[60vh] sm:gap-4 sm:px-6 sm:pb-24 sm:pt-12">
        <p className="m-0 text-[clamp(1.5rem,4vw,3rem)] font-medium tracking-[-0.05em]">
          THE END
        </p>
        <span className="max-w-[36ch] text-sm text-[#555] sm:text-[0.9rem]">
          The card layout design is an example - you can fully customize it to
          fit your needs.
        </span>
      </section>
    </div>
  );
}
