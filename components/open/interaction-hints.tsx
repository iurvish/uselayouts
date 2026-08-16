"use client";

import * as React from "react";

import type { InteractionHint, InteractionHintConfig, ScrollDirection } from "@/lib/open/hints";

export function InteractionHintLayer({
  config,
  playing,
}: {
  config: InteractionHintConfig;
  playing: boolean;
}) {
  if (!playing || config.items.length === 0) return null;

  const scale = (config.scale ?? 70) / 70;

  return (
    <div className="pointer-events-none relative h-full w-full overflow-visible" aria-hidden>
      {config.items.some((item) => item.kind === "drag") ? (
        <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {config.items.map((item) =>
            item.kind === "drag" && item.x2 != null && item.y2 != null ? (
              <line
                key={item.id}
                x1={item.x}
                y1={item.y}
                x2={item.x2}
                y2={item.y2}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="0.35"
                strokeDasharray="1.6 1.4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null,
          )}
        </svg>
      ) : null}
      {config.items.map((item) => (
        <HintMark key={item.id} item={item} scale={scale} />
      ))}
    </div>
  );
}

function HintMark({ item, scale }: { item: InteractionHint; scale: number }) {
  const dx = (item.x2 ?? item.x) - item.x;
  const dy = (item.y2 ?? item.y) - item.y;

  return (
    <>
      {item.kind === "drag" && item.x2 != null && item.y2 != null ? (
        <span
          className="absolute rounded-full bg-white/25"
          style={{
            left: `${item.x2}%`,
            top: `${item.y2}%`,
            width: 10 * scale,
            height: 10 * scale,
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : null}
      <div
        className="absolute"
        style={{
          left: `${item.x}%`,
          top: `${item.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {item.kind === "tap" ? <TapMark scale={scale} /> : null}
        {item.kind === "scroll" ? (
          <ScrollMark direction={item.direction ?? "down"} scale={scale} />
        ) : null}
        {item.kind === "drag" ? <DragMark dx={dx} dy={dy} scale={scale} /> : null}
      </div>
    </>
  );
}

function TapMark({ scale }: { scale: number }) {
  const size = 12 * scale;

  return (
    <span className="relative block" style={{ width: size, height: size }}>
      <span className="hint-ripple absolute inset-0 rounded-full border border-white/60" />
      <span className="hint-ripple absolute inset-0 rounded-full border border-white/40 [animation-delay:380ms]" />
      <span
        className="absolute inset-[22%] rounded-full bg-white"
        style={{ boxShadow: "0 0 0 5px rgba(255,255,255,0.08)" }}
      />
    </span>
  );
}

function ScrollMark({ direction, scale }: { direction: ScrollDirection; scale: number }) {
  const rotate =
    direction === "up" ? 180 : direction === "left" ? 90 : direction === "right" ? -90 : 0;

  return (
    <span className="flex" style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}>
      <span className="hint-scroll-nudge flex flex-col items-center gap-0.5">
        <span className="hint-chevron block size-0 border-x-[4.5px] border-t-[6.5px] border-x-transparent border-t-white/85" />
        <span className="hint-chevron block size-0 border-x-[4.5px] border-t-[6.5px] border-x-transparent border-t-white/85 [animation-delay:140ms]" />
        <span className="hint-chevron block size-0 border-x-[4.5px] border-t-[6.5px] border-x-transparent border-t-white/85 [animation-delay:280ms]" />
      </span>
    </span>
  );
}

function DragMark({ dx, dy, scale }: { dx: number; dy: number; scale: number }) {
  const size = 11 * scale;

  return (
    <>
      <span
        className="hint-drag-travel absolute left-1/2 top-1/2 rounded-full bg-white/40"
        style={
          {
            width: size * 0.62,
            height: size * 0.62,
            marginLeft: (-size * 0.62) / 2,
            marginTop: (-size * 0.62) / 2,
            "--hint-dx": `calc(${dx} * 1cqw)`,
            "--hint-dy": `calc(${dy} * 1cqh)`,
            animationDelay: "160ms",
          } as React.CSSProperties
        }
      />
      <span
        className="hint-drag-travel absolute left-1/2 top-1/2 rounded-full bg-white"
        style={
          {
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            "--hint-dx": `calc(${dx} * 1cqw)`,
            "--hint-dy": `calc(${dy} * 1cqh)`,
            boxShadow: "0 0 0 5px rgba(255,255,255,0.1)",
          } as React.CSSProperties
        }
      />
    </>
  );
}
