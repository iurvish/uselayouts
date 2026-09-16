"use client";

import * as React from "react";
import ConfidentialFolder from "@/registry/default/example/confidential-folder";
import { HERO_COPY } from "./tiers-shared";
import { RibbonField, type RibbonPatternMode } from "./ribbon-pattern";

const RULE = "oklch(0.28 0.02 95 / 0.14)";
const FOLDER_W = 454;
const FOLDER_H = 584;

function Cover({ pattern }: { pattern: RibbonPatternMode }) {
  const stripeRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex h-full flex-col justify-between gap-6 p-6">
      <div
        ref={stripeRef}
        className="pointer-events-auto relative aspect-[356/210] w-full overflow-hidden"
      >
        <RibbonField mode={pattern} boundsRef={stripeRef} />
      </div>
      <div className="relative flex flex-col gap-3.5 text-white">
        <p className="text-balance text-[28px] leading-[1.15] tracking-[-1.12px]">
          {HERO_COPY.title}
        </p>
        <p className="text-[16px] leading-[1.4] tracking-[-0.24px] text-white/70">
          {HERO_COPY.body}
        </p>
      </div>
    </div>
  );
}

function LetterFront() {
  return (
    <div className="flex h-full flex-col py-5 pr-3 pl-5 font-mono text-[10px] leading-[1.55] tracking-[0.01em] text-[oklch(0.42_0.02_95)]">
      <p className="tracking-[0.14em] text-[oklch(0.32_0.02_95)] uppercase">
        A note
      </p>
      <div className="mt-4 space-y-1">
        <p>from: Urvish</p>
        <p>to: you</p>
        <p>re: keeping this free</p>
      </div>
      <div className="mt-4 h-px" style={{ background: RULE }} />
      <p className="mt-4 max-w-[36ch] text-pretty">
        I build uselayouts after work, in the hours I have left. Your help
        buys me more of those hours.
      </p>
      <p className="mt-4 max-w-[36ch] text-pretty">
        That time goes into new components, and into growing this library so
        it stays free.
      </p>
      <p className="mt-auto tracking-[0.12em] uppercase">Thank you</p>
    </div>
  );
}

function LetterBack() {
  return (
    <div className="flex h-full flex-col px-6 py-6">
      <div className="border-b pb-3" style={{ borderColor: RULE }}>
        <p className="font-mono text-[10px] tracking-[0.16em] text-[oklch(0.42_0.02_95)] uppercase">
          From Urvish
        </p>
        <p className="mt-1 font-sans text-[15px] leading-tight tracking-[-0.02em] text-[oklch(0.24_0.02_95)]">
          Keep this free
        </p>
      </div>
      <div className="my-auto space-y-4">
        <p className="font-sans text-[15px] leading-[1.45] tracking-[-0.015em] text-[oklch(0.24_0.02_95)] text-pretty">
          I build uselayouts after work, in the hours I have left.
        </p>
        <p className="font-sans text-[15px] leading-[1.45] tracking-[-0.015em] text-[oklch(0.24_0.02_95)] text-pretty">
          Your help buys me more of those hours. I put them into new
          components, and into growing this library so it stays free.
        </p>
        <p className="font-sans text-[15px] leading-[1.45] tracking-[-0.015em] text-[oklch(0.24_0.02_95)] text-pretty">
          If something here has saved you time, that’s why I’m
          asking.
        </p>
      </div>
      <div
        className="flex items-end justify-end border-t pt-3"
        style={{ borderColor: RULE }}
      >
        <p className="font-sans text-[15px] tracking-[-0.02em] text-[oklch(0.24_0.02_95)]">
          - Urvish
        </p>
      </div>
    </div>
  );
}

export function HeroFolder({
  pattern = "cylinder",
}: {
  pattern?: RibbonPatternMode;
}) {
  return (
    <ConfidentialFolder
      className="w-full"
      stage={false}
      width={FOLDER_W}
      height={FOLDER_H}
      letterZIndex={999}
      title={HERO_COPY.title}
      subtitle={HERO_COPY.body}
      cover={<Cover pattern={pattern} />}
      letterFront={<LetterFront />}
      letterBack={<LetterBack />}
    />
  );
}
