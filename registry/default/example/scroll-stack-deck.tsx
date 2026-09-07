"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export interface ProjectItem {
  id: string | number;
  tabTitle: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  color: string;
  textColor?: string;
}

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    tabTitle: "01 · Loom",
    title: "Loom: A quieter workspace for deep focus teams",
    description:
      "An uncluttered collaboration suite built around calm layouts, soft surfaces, and intentional empty space so teams can think without visual noise.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    color: "#C9DFF5",
  },
  {
    id: 2,
    tabTitle: "02 · Meridian",
    title: "Meridian: Mapping brand systems that scale",
    description:
      "A living token library and component kit that keeps product, marketing, and docs speaking the same visual language across every surface.",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1600&q=80",
    color: "#C8EBD8",
  },
  {
    id: 3,
    tabTitle: "03 · Drift",
    title: "Drift: Editorial storytelling for modern labels",
    description:
      "A scrolling magazine experience for independent artists. Long-form interviews, soft typography, and photography that feels like a late-night listen.",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80",
    color: "#F2D4E4",
  },
  {
    id: 4,
    tabTitle: "04 · Harbor",
    title: "Harbor: Booking that feels like hospitality",
    description:
      "A reservation flow redesigned around trust cues, soft color, and clear hierarchy, so guests feel welcomed before they ever arrive.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    color: "#F7E0C8",
  },
  {
    id: 5,
    tabTitle: "05 · Northline",
    title: "Northline: Analytics without the overwhelm",
    description:
      "A metrics dashboard that leads with narrative charts and muted accents, helping operators spot what matters without drowning in widgets.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    color: "#DDD4F2",
  },
];

interface AnimatedCardProps {
  project: ProjectItem;
  index: number;
  totalCards: number;
  smoothProgress: MotionValue<number>;
}

function buildCardKeyframes(index: number, totalCards: number) {
  const steps: number[] = [];
  const yValues: number[] = [];
  const scaleValues: number[] = [];
  const numTransitions = Math.max(totalCards - 1, 1);

  for (let step = 0; step <= numTransitions; step++) {
    const progress = step / numTransitions;
    steps.push(progress);

    if (step < index) {
      yValues.push(900);
      scaleValues.push(1);
    } else if (step === index) {
      yValues.push(0);
      scaleValues.push(1);
    } else {
      const stackDepth = step - index;
      yValues.push(-stackDepth * 48);
      scaleValues.push(1 - stackDepth * 0.038);
    }
  }

  if (index === 0) {
    return {
      steps,
      y: yValues,
      scale: scaleValues,
    };
  }

  const entryStart = (index - 1) / numTransitions;
  const entryEnd = index / numTransitions;
  const fullSteps: number[] = [];
  const fullY: number[] = [];
  const fullScale: number[] = [];

  for (let i = 0; i < steps.length; i++) {
    if (steps[i] < entryStart) {
      fullSteps.push(steps[i]);
      fullY.push(900);
      fullScale.push(1);
    }
  }

  fullSteps.push(entryStart);
  fullY.push(900);
  fullScale.push(1);

  for (let i = 0; i < steps.length; i++) {
    if (steps[i] >= entryEnd) {
      fullSteps.push(steps[i]);
      fullY.push(yValues[i]);
      fullScale.push(scaleValues[i]);
    }
  }

  return {
    steps: fullSteps,
    y: fullY,
    scale: fullScale,
  };
}

function AnimatedCard({
  project,
  index,
  totalCards,
  smoothProgress,
}: AnimatedCardProps) {
  const keyframes = buildCardKeyframes(index, totalCards);
  const y = useTransform(smoothProgress, keyframes.steps, keyframes.y);
  const scale = useTransform(smoothProgress, keyframes.steps, keyframes.scale);

  return (
    <motion.div
      style={{
        y,
        scale,
        zIndex: 700 + index * 10,
        transformOrigin: "center top",
        willChange: "transform",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
      }}
      className="absolute inset-x-0 top-0 w-full select-none"
    >
      <a
        href={project.link ?? "#"}
        target={project.link ? "_blank" : undefined}
        rel={project.link ? "noopener noreferrer" : undefined}
        className="group block cursor-pointer text-inherit no-underline outline-none"
        aria-label={`Open ${project.title}`}
      >
        <article className="relative box-border w-full pt-14">
          <div
            style={{ backgroundColor: project.color }}
            className="absolute left-0 top-0 flex h-12 w-44 items-center rounded-t-2xl px-4 text-base font-semibold tracking-tight text-black shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)] sm:h-14 sm:w-60 sm:px-6"
          >
            <span className="truncate">{project.tabTitle}</span>
          </div>

          <div
            style={{ backgroundColor: project.color }}
            className="relative grid min-h-[28rem] grid-cols-1 items-center gap-6 overflow-hidden rounded-b-2xl rounded-tr-2xl p-6 shadow-[0_4px_8px_-4px_rgba(0,0,0,0.12),inset_0_-2px_4px_-2px_rgba(0,0,0,0.25)] sm:p-8 md:min-h-[33rem] md:grid-cols-[minmax(0,1.12fr)_minmax(16rem,0.88fr)] md:gap-14 md:p-8"
          >
            <div className="z-10 flex flex-col items-start gap-3.5">
              <h3 className="m-0 text-2xl font-medium leading-tight tracking-tight text-black sm:text-3xl">
                {project.title}
              </h3>

              <p className="m-0 text-base font-normal leading-snug tracking-normal text-black/60 sm:text-lg">
                {project.description}
              </p>
            </div>

            <div className="relative h-60 w-full overflow-hidden rounded-xl bg-white/25 sm:h-72 md:h-96 lg:h-[25rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={project.title}
                decoding="async"
                loading={index === 0 ? "eager" : "lazy"}
                className="block h-full w-full rounded-xl object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
              />
            </div>
          </div>
        </article>
      </a>
    </motion.div>
  );
}

export interface ScrollStackDeckProps {
  projects?: ProjectItem[];
  title?: string;
  subtitle?: string;
  scrollIndicatorText?: string;
  className?: string;
  showFooter?: boolean;
  enableLenis?: boolean;
}

export function ScrollStackDeck({
  projects = DEFAULT_PROJECTS,
  title = "Selected work",
  subtitle = "Five recent builds: soft interfaces, clear systems, and product stories that hold up under a slow scroll.",
  scrollIndicatorText = "Scroll",
  className = "",
  showFooter = true,
  enableLenis = true,
}: ScrollStackDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enableLenis) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let animationFrameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [enableLenis]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.15,
    restDelta: 0.0001,
  });

  return (
    <div
      className={`min-h-screen w-full bg-[#F4F6F8] font-sans text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white ${className}`}
    >
      <section className="flex w-full flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex max-w-3xl flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-2.5">
            <h1 className="m-0 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              {title}
            </h1>
            <p className="m-0 max-w-2xl text-xl font-normal leading-relaxed tracking-tight text-neutral-600 sm:text-2xl">
              {subtitle}
            </p>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2.5">
            <span className="text-lg font-normal leading-relaxed tracking-tight text-neutral-600 sm:text-xl">
              {scrollIndicatorText}
            </span>
            <motion.svg
              animate={{ y: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
              className="h-6 w-6 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4.75v13.5M6.75 13.75l5.25 5.5 5.25-5.5" />
            </motion.svg>
          </div>
        </div>
      </section>

      <section
        ref={containerRef}
        aria-label="Stacked project showcase"
        className="relative w-full"
        style={{ height: `${projects.length * 110}vh` }}
      >
        <div className="pointer-events-none sticky top-0 grid h-screen min-h-screen w-full place-items-center px-4">
          <div className="pointer-events-auto relative h-[37rem] min-h-[37rem] w-[min(calc(100%-2rem),62.5rem)] overflow-visible">
            {projects.map((project, index) => (
              <AnimatedCard
                key={project.id}
                project={project}
                index={index}
                totalCards={projects.length}
                smoothProgress={smoothProgress}
              />
            ))}
          </div>
        </div>
      </section>

      {showFooter ? (
        <footer className="flex h-[50vh] flex-col items-center justify-center gap-2 text-sm text-neutral-500">
          <p>shadcnlabs</p>
          <p className="text-xs text-neutral-400">
            Soft systems · product craft · motion
          </p>
        </footer>
      ) : null}
    </div>
  );
}

export default ScrollStackDeck;
