"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Lenis from "lenis";
import { CARDS } from "./cards";

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

function Layer({
  index,
  progress,
  peelY,
  reduceMotion,
  children,
}: {
  index: number;
  progress: MotionValue<number>;
  peelY: number;
  reduceMotion: boolean;
  children: ReactNode;
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
        <motion.div
          style={{
            y: innerY,
            rotateX: innerRx,
            transformPerspective: 500,
            transformOrigin: "50% 100%",
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function StackEngine({
  canvasClassName,
  renderCard,
}: {
  canvasClassName: string;
  renderCard: (card: StackCard) => ReactNode;
}) {
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
    <div className={canvasClassName}>
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
                <Layer
                  key={card.index}
                  index={i}
                  progress={scrollYProgress}
                  peelY={peelY}
                  reduceMotion={reduceMotion}
                >
                  {renderCard(card)}
                </Layer>
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
