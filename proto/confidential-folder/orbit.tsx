"use client";

import * as React from "react";
import { COPY, FolderShell } from "./shared";

const SLEEVE = "oklch(0.26 0.01 260)";
const PAPER = "oklch(0.962 0.014 95)";
const RULE = "oklch(0.28 0.02 95 / 0.14)";

const ORBIT_CX = 160;
const ORBIT_CY = 176;
const ORBIT_RX = 108;
const ORBIT_RY = 44;
const ORBIT_ROTS = [0, 26, 52, 78, 104, 130, 156];

const ORBIT_NODES: { deg: number; r: 2 | 1 }[][] = [
  [
    { deg: 8, r: 2 },
    { deg: 41, r: 1 },
    { deg: 54, r: 2 },
    { deg: 203, r: 1 },
  ],
  [
    { deg: 67, r: 2 },
    { deg: 188, r: 1 },
    { deg: 301, r: 2 },
  ],
  [
    { deg: 14, r: 1 },
    { deg: 22, r: 2 },
    { deg: 119, r: 1 },
    { deg: 246, r: 2 },
    { deg: 338, r: 1 },
  ],
  [
    { deg: 96, r: 2 },
    { deg: 271, r: 1 },
  ],
  [
    { deg: 33, r: 1 },
    { deg: 148, r: 2 },
    { deg: 161, r: 1 },
    { deg: 284, r: 2 },
  ],
  [
    { deg: 77, r: 1 },
    { deg: 215, r: 2 },
    { deg: 352, r: 1 },
  ],
  [
    { deg: 5, r: 2 },
    { deg: 128, r: 1 },
    { deg: 174, r: 2 },
    { deg: 319, r: 1 },
  ],
];

const TITLE = "Stay hungry";
const SUBTITLE = "For people who still build the work.";

function OrbitGraphic() {
  return (
    <svg
      viewBox="0 0 320 400"
      className="pointer-events-none absolute inset-0 h-full w-full select-none text-[oklch(0.58_0.016_260)]"
      aria-hidden
    >
      {ORBIT_ROTS.map((rot, i) => (
        <g key={rot} transform={`rotate(${rot} ${ORBIT_CX} ${ORBIT_CY})`}>
          <ellipse
            cx={ORBIT_CX}
            cy={ORBIT_CY}
            rx={ORBIT_RX}
            ry={ORBIT_RY}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          {ORBIT_NODES[i]!.map((node) => {
            const t = (node.deg * Math.PI) / 180;
            return (
              <circle
                key={node.deg}
                cx={Math.round(ORBIT_CX + ORBIT_RX * Math.cos(t))}
                cy={Math.round(ORBIT_CY + ORBIT_RY * Math.sin(t))}
                r={node.r}
                fill="currentColor"
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

function Cover() {
  return (
    <>
      <OrbitGraphic />
      <div className="relative flex h-full flex-col justify-end px-6 py-7">
        <div>
          <h3 className="font-[family-name:var(--font-geist-sans)] text-[22px] leading-[1.12] tracking-[-0.03em] text-[oklch(0.94_0.01_260)]">
            {TITLE}
          </h3>
          <p className="mt-2 whitespace-nowrap font-[family-name:var(--font-geist-sans)] text-[13px] leading-snug text-[oklch(0.68_0.01_260)]">
            {SUBTITLE}
          </p>
        </div>
      </div>
    </>
  );
}

function LetterFront() {
  return (
    <div className="flex h-full flex-col py-5 pr-3 pl-5 font-[family-name:var(--font-geist-mono)] text-[10px] leading-[1.55] tracking-[0.01em] text-[oklch(0.42_0.02_95)]">
      <p className="tracking-[0.14em] text-[oklch(0.32_0.02_95)] uppercase">
        Product brief
      </p>
      <div className="mt-4 space-y-1">
        <p>from: s.jobs@</p>
        <p>to: the room</p>
        <p>re: {TITLE}</p>
      </div>
      <div className="mt-4 h-px" style={{ background: RULE }} />
      <p className="mt-4 max-w-[36ch] text-pretty">
        Do not design by committee. The work either sings in the hand or it
        does not. Cut until a stranger understands it in one look.
      </p>
      <ol className="mt-4 space-y-1 tabular-nums">
        <li>1. Start with the feeling</li>
        <li>2. Remove until it is obvious</li>
        <li>3. Ship before you explain</li>
      </ol>
      <p className="mt-auto tracking-[0.12em] uppercase">{COPY.badge}</p>
    </div>
  );
}

function Colophon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10 text-[oklch(0.28_0.02_95)]"
      aria-hidden
    >
      <ellipse cx="24" cy="24" rx="16" ry="7" fill="none" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="24" cy="24" rx="16" ry="7" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="16" ry="7" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(120 24 24)" />
    </svg>
  );
}

function LetterBack() {
  return (
    <div className="flex h-full flex-col px-6 py-6">
      <div className="flex items-end justify-between gap-3 border-b pb-3" style={{ borderColor: RULE }}>
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.16em] text-[oklch(0.42_0.02_95)] uppercase">
            Closed session
          </p>
          <p className="mt-1 font-[family-name:var(--font-geist-sans)] text-[15px] leading-tight tracking-[-0.02em] text-[oklch(0.24_0.02_95)]">
            The room
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
      <div className="flex items-end justify-end border-t pt-3" style={{ borderColor: RULE }}>
        <Colophon />
      </div>
    </div>
  );
}

const CUT =
  "radial-gradient(circle 18px at 100% 50%, transparent 16.5px, #000 17.5px)";

export function OrbitFolder() {
  return (
    <FolderShell
      title={TITLE}
      sleeveFill={SLEEVE}
      letterFill={PAPER}
      cover={<Cover />}
      letterFront={<LetterFront />}
      letterBack={<LetterBack />}
      tuckX={44}
      coverStyle={{
        WebkitMaskImage: CUT,
        maskImage: CUT,
      }}
    />
  );
}
