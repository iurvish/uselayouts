"use client";

import * as React from "react";
import { COPY, FolderShell } from "./shared";

const SLEEVE = "oklch(0.22 0.008 260)";
const STROKE = "oklch(0.52 0.014 260)";
const PAPER = "oklch(0.962 0.014 95)";
const INK = "oklch(0.28 0.02 95)";
const MUTED = "oklch(0.48 0.02 95)";
const RULE = "oklch(0.28 0.02 95 / 0.14)";

function ellipsePoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotDeg: number,
  t: number,
) {
  const rot = (rotDeg * Math.PI) / 180;
  const x0 = rx * Math.cos(t);
  const y0 = ry * Math.sin(t);
  return {
    x: cx + x0 * Math.cos(rot) - y0 * Math.sin(rot),
    y: cy + x0 * Math.sin(rot) + y0 * Math.cos(rot),
  };
}

function OrbitGraphic() {
  const cx = 160;
  const cy = 168;
  const rx = 108;
  const ry = 44;
  const rots = [0, 26, 52, 78, 104, 130, 156];
  const nodes = rots.flatMap((rot, i) => {
    const ts = i % 2 === 0 ? [0.35, 2.2, 3.7] : [1.1, 4.4];
    return ts.map((t) => ellipsePoint(cx, cy, rx, ry, rot, t));
  });

  return (
    <svg
      viewBox="0 0 320 400"
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
      aria-hidden
    >
      {rots.map((rot) => (
        <ellipse
          key={rot}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={STROKE}
          strokeWidth="1"
          transform={`rotate(${rot} ${cx} ${cy})`}
        />
      ))}
      {nodes.map((p, i) => (
        <circle
          key={`${p.x}-${p.y}-${i}`}
          cx={p.x}
          cy={p.y}
          r={i % 4 === 0 ? 2.4 : 1.4}
          fill={i % 4 === 0 ? "oklch(0.72 0.02 260)" : STROKE}
        />
      ))}
    </svg>
  );
}

function Cover() {
  return (
    <>
      <OrbitGraphic />
      <div className="relative flex h-full flex-col justify-between px-6 py-7">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.18em] text-[oklch(0.78_0.01_260)] uppercase">
          Uselayouts
        </p>
        <div className="max-w-[11rem]">
          <h3 className="font-[family-name:var(--font-geist-sans)] text-[22px] leading-[1.12] tracking-[-0.03em] text-[oklch(0.94_0.01_260)] text-balance">
            {COPY.title} brief
          </h3>
          <p className="mt-2 font-[family-name:var(--font-geist-sans)] text-[12px] leading-snug text-[oklch(0.68_0.01_260)] text-pretty">
            {COPY.subtitle}
          </p>
        </div>
      </div>
    </>
  );
}

function LetterFront() {
  return (
    <div className="flex h-full flex-col px-5 py-5 font-[family-name:var(--font-geist-mono)] text-[10px] leading-[1.55] tracking-[0.01em] text-[oklch(0.42_0.02_95)]">
      <p className="tracking-[0.14em] text-[oklch(0.32_0.02_95)] uppercase">
        Internal memo
      </p>
      <div className="mt-4 space-y-1 tabular-nums">
        <p>from: people@uselayouts.com</p>
        <p>to: committee@internal</p>
        <p>re: {COPY.badge} compensation review</p>
      </div>
      <div className="mt-4 h-px" style={{ background: RULE }} />
      <p className="mt-4 max-w-[36ch] text-pretty">
        Do not circulate outside this thread. Figures are attached as a sealed
        sheet. Holders, ranges, and exceptions follow.
      </p>
      <ol className="mt-4 space-y-1 tabular-nums">
        <li>1. Holders — banded by level</li>
        <li>2. Ranges — Q3 freeze excepted</li>
        <li>3. Exceptions — named in annex</li>
      </ol>
      <p className="mt-auto tracking-[0.12em] uppercase">{COPY.badge}</p>
    </div>
  );
}

function Colophon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
      <ellipse
        cx="24"
        cy="24"
        rx="16"
        ry="7"
        fill="none"
        stroke={INK}
        strokeWidth="1"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="16"
        ry="7"
        fill="none"
        stroke={INK}
        strokeWidth="1"
        transform="rotate(60 24 24)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="16"
        ry="7"
        fill="none"
        stroke={INK}
        strokeWidth="1"
        transform="rotate(120 24 24)"
      />
      <circle cx="24" cy="24" r="1.6" fill={INK} />
    </svg>
  );
}

function LetterBack() {
  return (
    <div className="flex h-full flex-col px-6 py-6">
      <div className="flex items-end justify-between gap-3 border-b pb-3" style={{ borderColor: RULE }}>
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.16em] text-[oklch(0.42_0.02_95)] uppercase">
            Correspondence
          </p>
          <p className="mt-1 font-[family-name:var(--font-geist-sans)] text-[15px] leading-tight tracking-[-0.02em] text-[oklch(0.24_0.02_95)]">
            People committee
          </p>
        </div>
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums tracking-[0.08em] text-[oklch(0.45_0.02_95)]">
          {COPY.badge}
        </span>
      </div>
      <div className="my-auto space-y-3">
        <p className="font-[family-name:var(--font-geist-sans)] text-[15px] leading-[1.45] tracking-[-0.015em] text-[oklch(0.24_0.02_95)] text-pretty">
          {COPY.message}
        </p>
        <p className="font-[family-name:var(--font-geist-sans)] text-[13px] leading-[1.45] text-[oklch(0.45_0.02_95)] text-pretty">
          {COPY.punchline}
        </p>
      </div>
      <div className="flex items-end justify-between gap-3 border-t pt-3" style={{ borderColor: RULE }}>
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.12em] text-[oklch(0.5_0.02_95)] uppercase">
          File sealed
        </p>
        <Colophon />
      </div>
    </div>
  );
}

export function OrbitFolder() {
  return (
    <FolderShell
      sleeveFill={SLEEVE}
      letterFill={PAPER}
      cover={<Cover />}
      letterFront={<LetterFront />}
      letterBack={<LetterBack />}
      coverStyle={{
        WebkitMaskImage:
          "radial-gradient(circle 20px at 100% 50%, transparent 19px, #000 20.5px)",
        maskImage:
          "radial-gradient(circle 20px at 100% 50%, transparent 19px, #000 20.5px)",
      }}
    />
  );
}
