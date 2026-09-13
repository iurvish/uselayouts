"use client";

import * as React from "react";
import { FolderShell } from "./shared";

const FIELD = "oklch(0.27 0.055 255)";
const PAPER = "oklch(0.97 0.008 250)";
const RULE = "oklch(0.28 0.04 255 / 0.14)";

const TITLE = "Insanely great";
const SUBTITLE = "Cut it until a stranger wants it before they know why.";
const BADGE = "#2007";
const MESSAGE =
  "Good enough is a tax. Make the thing so obvious that explaining it feels like an apology.";
const PUNCHLINE = "If you are proud of the process, you shipped too early.";

function StairField() {
  return (
    <svg
      viewBox="0 0 320 400"
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
      aria-hidden
    >
      <path
        d="M96 400 V 340 H 128 V 292 H 160 V 244 H 192 V 196 H 224 V 148 H 256 V 100 H 288 V 64 H 320 V 400 Z"
        className="fill-white/[0.08]"
      />
    </svg>
  );
}

function Cover() {
  return (
    <>
      <StairField />
      <div className="relative flex h-full flex-col px-6 py-7">
        <h3 className="max-w-[12rem] font-[family-name:var(--font-geist-sans)] text-[22px] leading-[1.12] tracking-[-0.03em] text-[oklch(0.92_0.02_255)] text-balance">
          {TITLE}
        </h3>
        <p className="mt-2 max-w-[12rem] font-[family-name:var(--font-geist-sans)] text-[13px] leading-snug text-[oklch(0.78_0.03_255)] text-pretty">
          {SUBTITLE}
        </p>
      </div>
    </>
  );
}

function LetterFront() {
  return (
    <div className="relative flex h-full flex-col px-6 py-6">
      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.18em] text-[oklch(0.45_0.04_255)] uppercase">
        Brief
      </p>
      <div className="my-auto">
        <p className="font-[family-name:var(--font-geist-sans)] text-[22px] leading-[1.12] tracking-[-0.03em] text-[oklch(0.22_0.04_255)] text-balance">
          {TITLE}
        </p>
        <p className="mt-2 font-[family-name:var(--font-geist-sans)] text-[13px] text-[oklch(0.42_0.03_255)]">
          {SUBTITLE}
        </p>
      </div>
      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums tracking-[0.14em] text-[oklch(0.5_0.03_255)]">
        {BADGE}
      </p>
    </div>
  );
}

function LetterBack() {
  return (
    <div className="flex h-full flex-col px-6 py-6">
      <div className="flex items-end justify-between gap-3 border-b pb-3" style={{ borderColor: RULE }}>
        <p className="font-[family-name:var(--font-geist-sans)] text-[15px] leading-tight tracking-[-0.02em] text-[oklch(0.22_0.04_255)]">
          {TITLE}
        </p>
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums tracking-[0.08em] text-[oklch(0.5_0.03_255)]">
          {BADGE}
        </span>
      </div>
      <div className="my-auto space-y-3">
        <p className="font-[family-name:var(--font-geist-sans)] text-[15px] leading-[1.45] tracking-[-0.015em] text-[oklch(0.22_0.04_255)] text-pretty">
          {MESSAGE}
        </p>
        <p className="font-[family-name:var(--font-geist-sans)] text-[13px] leading-[1.45] text-[oklch(0.42_0.03_255)] text-pretty">
          {PUNCHLINE}
        </p>
      </div>
    </div>
  );
}

function PeekTab() {
  return <div className="h-full w-full" style={{ background: PAPER }} />;
}

export function FieldFolder() {
  return (
    <FolderShell
      title={TITLE}
      sleeveFill={FIELD}
      letterFill={PAPER}
      cover={<Cover />}
      letterFront={<LetterFront />}
      letterBack={<LetterBack />}
      peekTab={<PeekTab />}
    />
  );
}
