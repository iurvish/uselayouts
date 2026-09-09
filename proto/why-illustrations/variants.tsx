"use client";

import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

const WHY_INTERVAL_MS = 6000;

const whyActiveLine =
  "linear-gradient(in oklab 179.04deg, oklab(43.6% -0.034 -0.138) -260%, oklab(53% 0.114 0.016) 225.3%, oklab(86.5% 0.053 0.047) 720%)";

export type WhyPoint = {
  title: string;
  description: string;
  image: string;
  short: string;
};

type StyleConfig = {
  mediaBg: string;
  mediaFit: "cover" | "contain";
  mediaPad?: boolean;
};

const POINTS_META = [
  {
    title: "Copy. Customize. Ship.",
    description:
      "Start with production-ready components and make them your own. No locked-down abstractions. No fighting the library.",
    short: "Copy",
  },
  {
    title: "Motion that means something.",
    description:
      "Every animation is purposeful — feedback, focus, and flow — not decoration for its own sake.",
    short: "Motion",
  },
  {
    title: "Built to be changed.",
    description:
      "Clean, editable source you own. Swap tokens, restyle freely, and keep shipping without fighting abstractions.",
    short: "Change",
  },
  {
    title: "Skip the blank canvas.",
    description:
      "Start from patterns that already work. Less scaffolding, more product — from first commit to polished UI.",
    short: "Start",
  },
] as const;

function pointsFor(
  prefix: "coral" | "assembly" | "signal",
  keys: [string, string, string, string],
): WhyPoint[] {
  return POINTS_META.map((meta, i) => ({
    ...meta,
    image: `/proto/why-illustrations/why-${prefix}-${keys[i]}.png`,
  }));
}

export const CORAL_POINTS = pointsFor("coral", [
  "copy",
  "motion",
  "built",
  "blank",
]);
export const ASSEMBLY_POINTS = pointsFor("assembly", [
  "copy",
  "motion",
  "built",
  "blank",
]);
export const SIGNAL_POINTS = pointsFor("signal", [
  "copy",
  "motion",
  "built",
  "blank",
]);

function WhySection({
  points,
  style,
}: {
  points: WhyPoint[];
  style: StyleConfig;
}) {
  const [active, setActive] = React.useState(0);
  const [cycle, setCycle] = React.useState(0);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % points.length);
      setCycle((c) => c + 1);
    }, WHY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [cycle, points.length]);

  const select = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#1B1C1D] px-4 py-16 sm:px-8 lg:px-16 lg:py-20">
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-12 lg:gap-[72px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-[406px] text-[36px] leading-[1.15] tracking-[-0.04em] text-white sm:text-[48px]">
            Why Developers choose uselayouts
          </h2>
          <p className="max-w-[348px] text-[16px] leading-[1.5] text-white/70">
            You shouldn&apos;t have to spend hours rebuilding the same UI
            patterns before getting to the part that actually makes your product
            yours.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex w-full max-w-[564px] flex-col gap-8">
            {points.map((feature, i) => {
              const isActive = i === active;
              return (
                <button
                  key={feature.title}
                  type="button"
                  className="flex w-full cursor-pointer flex-col gap-8 text-left transition-colors duration-150"
                  onClick={() => select(i)}
                >
                  <div className="flex flex-col gap-4">
                    <span
                      className={cn(
                        "text-[20px] font-medium leading-6 tracking-[-0.02em] transition-colors duration-150",
                        isActive ? "text-white" : "text-[#9F9F9F]",
                      )}
                    >
                      {feature.title}
                    </span>
                    {isActive ? (
                      <p className="landing-why-fade max-w-[459px] text-[16px] leading-[1.5] text-white/80">
                        {feature.description}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className="relative h-0.5 w-full overflow-hidden bg-[#3C3C3C]"
                    aria-hidden
                  >
                    {isActive ? (
                      <span
                        key={cycle}
                        className="landing-why-progress absolute inset-y-0 left-0 h-full"
                        style={{
                          backgroundImage: whyActiveLine,
                          animation: `landing-why-progress ${WHY_INTERVAL_MS}ms linear forwards, landing-why-fade 220ms var(--ease-out) both`,
                        }}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className={cn(
              "relative h-[280px] w-full overflow-hidden rounded-2xl sm:h-[360px] lg:h-[400px] lg:w-[588px] lg:shrink-0",
              style.mediaPad && "p-4 sm:p-6",
            )}
            style={{ background: style.mediaBg }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <Image
                key={points[active]!.image}
                src={points[active]!.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 588px"
                className={cn(
                  "landing-why-fade",
                  style.mediaFit === "cover" ? "object-cover" : "object-contain",
                )}
                priority
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {points.map((feature, i) => (
            <button
              key={feature.image}
              type="button"
              onClick={() => select(i)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border transition-[border-color,transform] duration-150 ease-out active:scale-[0.98]",
                i === active
                  ? "border-white/40"
                  : "border-white/10 hover:border-white/25",
              )}
              style={{ background: style.mediaBg }}
              aria-label={`Show ${feature.title}`}
              aria-pressed={i === active}
            >
              <Image
                src={feature.image}
                alt=""
                fill
                sizes="140px"
                className={
                  style.mediaFit === "cover" ? "object-cover" : "object-contain p-2"
                }
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1.5 text-left text-[11px] font-medium tracking-wide text-white/90 uppercase">
                {feature.short}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Coral field + copper hardware — loud marketing energy */
export function CoralHardware() {
  return (
    <WhySection
      points={CORAL_POINTS}
      style={{ mediaBg: "#E8453C", mediaFit: "cover" }}
    />
  );
}

/** Floating assembly stacks — schematic product diagram */
export function FloatingAssembly() {
  return (
    <WhySection
      points={ASSEMBLY_POINTS}
      style={{ mediaBg: "#F4F4F2", mediaFit: "contain", mediaPad: true }}
    />
  );
}

/** Pink platform + lime/violet signal — card-system icons */
export function SignalPlatform() {
  return (
    <WhySection
      points={SIGNAL_POINTS}
      style={{ mediaBg: "#EDE8E0", mediaFit: "contain", mediaPad: true }}
    />
  );
}
