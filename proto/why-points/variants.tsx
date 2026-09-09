"use client";

import Image from "next/image";
import * as React from "react";

const POINTS = {
  motion: {
    label: "Motion",
    title: "Motion that means something.",
    description:
      "Every animation is purposeful — feedback, focus, and flow — not decoration for its own sake.",
    variants: [
      {
        name: "Trails",
        axis: "Dashed paths between modules",
        image: "/proto/why-points/proto-motion-trails.png",
      },
      {
        name: "Focus",
        axis: "Spotlight one panel, dim the rest",
        image: "/proto/why-points/proto-motion-focus.png",
      },
      {
        name: "Relay",
        axis: "Lever causes a UI state change",
        image: "/proto/why-points/proto-motion-relay.png",
      },
    ],
  },
  blank: {
    label: "Blank",
    title: "Skip the blank canvas.",
    description:
      "Start from patterns that already work. Less scaffolding, more product — from first commit to polished UI.",
    variants: [
      {
        name: "Foundation",
        axis: "Solid structure, only the top unfinished",
        image: "/proto/why-points/proto-blank-foundation.png",
      },
      {
        name: "Stamp",
        axis: "Press stamps a layout onto a blank sheet",
        image: "/proto/why-points/proto-blank-stamp.png",
      },
      {
        name: "Fill",
        axis: "Wireframe scaffold filling in solid",
        image: "/proto/why-points/proto-blank-fill.png",
      },
    ],
  },
} as const;

type PointKey = keyof typeof POINTS;

/** Coral plate matching homepage Figma surface */
function CoralSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-why-surface relative size-full overflow-hidden rounded-2xl">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/why/glow-a.svg"
          alt=""
          className="landing-why-surface-glow-a"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/why/glow-b.svg"
          alt=""
          className="landing-why-surface-glow-b"
        />
        <div className="landing-why-surface-grid" />
        <div className="landing-why-surface-light" />
      </div>
      <div className="relative z-[1] size-full">{children}</div>
    </div>
  );
}

export function WhyPointStage({
  pointKey,
  variantIndex,
}: {
  pointKey: PointKey;
  variantIndex: number;
}) {
  const point = POINTS[pointKey];
  const variant = point.variants[variantIndex] ?? point.variants[0]!;

  return (
    <section className="overflow-hidden rounded-2xl bg-[#1B1C1D] px-4 py-14 sm:px-8 lg:px-16 lg:py-16">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex w-full max-w-[420px] flex-col gap-4">
          <p className="font-mono text-[11px] tracking-wide text-white/35 uppercase">
            Exploring · {point.label}
          </p>
          <h2 className="text-[28px] leading-[1.2] tracking-[-0.03em] text-white sm:text-[36px]">
            {point.title}
          </h2>
          <p className="text-[16px] leading-[1.5] text-white/70">
            {point.description}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/45">
            <span className="text-white/70">{variant.name}</span>
            {" — "}
            {variant.axis}
          </p>
        </div>

        <div className="relative h-[300px] w-full sm:h-[380px] lg:h-[400px] lg:w-[588px] lg:shrink-0">
          <CoralSurface>
            <div className="absolute inset-[4%] sm:inset-[5%]">
              <Image
                key={variant.image}
                src={variant.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 588px"
                className="object-contain"
                priority
              />
            </div>
          </CoralSurface>
        </div>
      </div>
    </section>
  );
}

export { POINTS };
export type { PointKey };
