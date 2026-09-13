"use client";

import * as React from "react";
import { COPY, FolderShell } from "./shared";

const FIELD = "oklch(0.5 0.11 192)";
const STEP = "oklch(0.4 0.1 192)";
const DOT = "oklch(0.97 0.012 192)";
const PAPER = "oklch(0.97 0.012 95)";
const INK = "oklch(0.22 0.03 192)";
const MUTED = "oklch(0.42 0.04 192)";

function StairField() {
  const steps = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg
      viewBox="0 0 320 400"
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
      aria-hidden
    >
      {steps.map((i) => {
        const x = 92 + i * 28;
        const y = 72 + i * 34;
        return (
          <path
            key={i}
            d={`M ${x} ${y} h 200 v 34 H ${x + 28} V 400 H ${x} Z`}
            fill={STEP}
          />
        );
      })}
      <circle cx="118" cy="214" r="26" fill={DOT} />
    </svg>
  );
}

function Cover() {
  return (
    <>
      <StairField />
      <div className="relative flex h-full flex-col px-5 py-6">
        <p className="font-[family-name:var(--font-geist-sans)] text-[11px] tracking-[0.2em] text-white uppercase">
          {COPY.title}
        </p>
        <p
          className="absolute top-1/2 left-5 origin-left -translate-y-1/2 -rotate-90 font-[family-name:var(--font-geist-sans)] text-[11px] tracking-[0.18em] text-white/90 uppercase"
          style={{ transform: "translateY(-50%) rotate(-90deg) translateX(-40%)" }}
        >
          Internal only
        </p>
        <p className="mt-auto max-w-[9rem] font-[family-name:var(--font-geist-sans)] text-[13px] leading-snug text-white text-pretty">
          {COPY.subtitle}
        </p>
      </div>
    </>
  );
}

function LetterFront() {
  return (
    <div className="relative flex h-full flex-col px-6 py-6">
      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.18em] text-[oklch(0.45_0.04_192)] uppercase">
        Insert
      </p>
      <div className="my-auto flex flex-col items-center gap-5">
        <span
          className="block h-14 w-14 rounded-full"
          style={{ background: FIELD }}
          aria-hidden
        />
        <p className="text-center font-[family-name:var(--font-geist-sans)] text-[20px] leading-[1.1] tracking-[-0.03em] text-[oklch(0.22_0.03_192)] text-balance">
          Do not open
        </p>
      </div>
      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums tracking-[0.14em] text-[oklch(0.5_0.03_192)]">
        {COPY.badge}
      </p>
    </div>
  );
}

function StairMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
      <rect width="40" height="40" fill={FIELD} />
      <path d="M6 28h8v8H6zm8-8h8v16h-8zm8-8h8v24h-8zm8-6h8v30h-8z" fill={DOT} />
    </svg>
  );
}

function LetterBack() {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-5" style={{ background: FIELD }}>
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.18em] text-white/80 uppercase">
          Informator
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-geist-sans)] text-[22px] leading-[1.1] tracking-[-0.03em] text-white text-balance">
          {COPY.title}
        </h3>
      </div>
      <div className="flex flex-1 flex-col px-6 py-5">
        <p className="font-[family-name:var(--font-geist-sans)] text-[15px] leading-[1.45] tracking-[-0.015em] text-[oklch(0.22_0.03_192)] text-pretty">
          {COPY.message}
        </p>
        <p className="mt-3 font-[family-name:var(--font-geist-sans)] text-[13px] leading-[1.45] text-[oklch(0.4_0.04_192)] text-pretty">
          {COPY.punchline}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums tracking-[0.12em] text-[oklch(0.5_0.03_192)]">
            {COPY.badge}
          </p>
          <StairMark />
        </div>
      </div>
    </div>
  );
}

function PeekTab() {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: PAPER }}>
      <span className="block h-2.5 w-2.5 rounded-full" style={{ background: FIELD }} />
    </div>
  );
}

export function FieldFolder() {
  return (
    <FolderShell
      sleeveFill={FIELD}
      letterFill={PAPER}
      cover={<Cover />}
      letterFront={<LetterFront />}
      letterBack={<LetterBack />}
      peekTab={<PeekTab />}
    />
  );
}
