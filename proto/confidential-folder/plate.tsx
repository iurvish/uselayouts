"use client";

import * as React from "react";
import { COPY, FolderShell } from "./shared";

const PLATE = "oklch(0.14 0.014 300)";
const TYPE = "oklch(0.78 0.12 325)";
const LETTER = "oklch(0.12 0.01 300)";

const TOP_BARS = [18, 42, 10, 56, 28, 64, 14, 48, 8, 36, 22, 12, 40, 6, 30];
const BOTTOM_BARS = [110, 86, 124, 58, 96, 72, 40, 108, 64, 28, 48, 18, 34, 12, 8];
const COL_X = [64, 128, 192, 256];
const ROW_Y = [50, 100, 150, 200, 250, 300, 350];

function GridLines() {
  return (
    <svg
      viewBox="0 0 320 400"
      className="pointer-events-none absolute inset-0 h-full w-full select-none text-[oklch(0.74_0.14_325)]"
      aria-hidden
    >
      <rect x="1" y="1" width="318" height="398" fill="none" stroke="currentColor" strokeWidth="1" />
      {COL_X.map((x) => (
        <line key={`c${x}`} x1={x} y1="0" x2={x} y2="400" stroke="currentColor" strokeWidth="1" />
      ))}
      {ROW_Y.map((y) => (
        <line key={`r${y}`} x1="0" y1={y} x2="320" y2={y} stroke="currentColor" strokeWidth="1" />
      ))}
      <circle cx="214" cy="268" r="64" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="150" y1="332" x2="278" y2="204" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function Cover() {
  return (
    <>
      <GridLines />
      <div className="relative flex h-full flex-col px-5 py-6">
        <h3
          className="max-w-[11rem] font-[family-name:var(--font-geist-sans)] text-[26px] leading-[1.08] tracking-[-0.03em] text-balance"
          style={{ color: TYPE }}
        >
          {COPY.title}
        </h3>
        <p className="mt-auto font-[family-name:var(--font-geist-mono)] text-[28px] leading-none tabular-nums tracking-[-0.04em]" style={{ color: TYPE }}>
          06
        </p>
      </div>
    </>
  );
}

function Barcode({
  bars,
  from,
}: {
  bars: number[];
  from: "top" | "bottom";
}) {
  const gap = 4;
  const w = 12;
  return (
    <svg
      viewBox="0 0 236 130"
      className="h-[78px] w-full text-white"
      aria-hidden
      preserveAspectRatio="none"
    >
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * (w + gap)}
          y={from === "top" ? 0 : 130 - h}
          width={w}
          height={h}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function LetterFront() {
  return (
    <div className="flex h-full flex-col justify-between px-5 py-5 outline outline-1 outline-[oklch(0.74_0.14_325)]">
      <Barcode bars={TOP_BARS} from="top" />
      <Barcode bars={TOP_BARS} from="top" />
      <div className="py-4">
        <h3 className="font-[family-name:var(--font-geist-sans)] text-[28px] leading-[1.05] tracking-[-0.03em] text-white text-balance">
          {COPY.title}
        </h3>
        <p className="mt-3 max-w-[28ch] font-[family-name:var(--font-geist-sans)] text-[12px] leading-[1.45] text-white/70 text-pretty">
          Restricted correspondence. Open only if you already know what is
          inside.
        </p>
      </div>
      <Barcode bars={BOTTOM_BARS} from="bottom" />
    </div>
  );
}

function LetterBack() {
  return (
    <div className="flex h-full flex-col px-5 py-5 outline outline-1 outline-[oklch(0.74_0.14_325)]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.18em] text-white/55 uppercase">
          File 06
        </p>
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums tracking-[0.12em] text-white/55">
          {COPY.badge}
        </p>
      </div>
      <div className="mt-4">
        <Barcode bars={TOP_BARS} from="top" />
      </div>
      <div className="my-auto space-y-3 py-4">
        <p className="font-[family-name:var(--font-geist-sans)] text-[16px] leading-[1.4] tracking-[-0.02em] text-white text-pretty">
          {COPY.message}
        </p>
        <p className="font-[family-name:var(--font-geist-sans)] text-[13px] leading-[1.45] text-white/60 text-pretty">
          {COPY.punchline}
        </p>
      </div>
      <Barcode bars={BOTTOM_BARS} from="bottom" />
    </div>
  );
}

function PeekTab() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[oklch(0.74_0.14_325)]">
      <span
        className="font-[family-name:var(--font-geist-mono)] text-[8px] tracking-[0.18em] text-[oklch(0.14_0.014_300)] uppercase"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        06
      </span>
    </div>
  );
}

export function PlateFolder() {
  return (
    <FolderShell
      sleeveFill={PLATE}
      letterFill={LETTER}
      cover={<Cover />}
      letterFront={<LetterFront />}
      letterBack={<LetterBack />}
      peekTab={<PeekTab />}
    />
  );
}
