"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

let cachedCanvas: HTMLCanvasElement | null = null;
let cachedCtx: CanvasRenderingContext2D | null = null;

function getCanvas(): CanvasRenderingContext2D {
  if (!cachedCtx) {
    cachedCanvas = document.createElement("canvas");
    const ctx = cachedCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2d context from canvas");
    }
    cachedCtx = ctx;
  }
  return cachedCtx;
}

function measureText(text: string, font: string) {
  const ctx = getCanvas();
  ctx.font = font;
  return ctx.measureText(text).width;
}

function getComputedFont(el: HTMLElement) {
  const cs = window.getComputedStyle(el);
  return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
}

function debounceWithRAF<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let rafId: number | undefined;

  return (...args: Args): void => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    if (rafId !== undefined) cancelAnimationFrame(rafId);

    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        fn(...args);
      });
    }, delay);
  };
}

function computeTruncated(
  text: string,
  end: number | undefined,
  minEnd: number | undefined,
  containerW: number,
  font: string,
  ellipsis: string,
): string {
  const fullW = measureText(text, font);
  if (fullW <= containerW) return text;

  if (end !== undefined) {
    const endStr = text.slice(-end);
    const endW = measureText(ellipsis + endStr, font);
    const available = containerW - endW;

    let lo = 0;
    let hi = text.length - end;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (measureText(text.slice(0, mid), font) <= available) lo = mid;
      else hi = mid - 1;
    }

    return text.slice(0, lo) + ellipsis + endStr;
  }

  const ellipsisW = measureText(ellipsis, font);
  const availableForText = containerW - ellipsisW;

  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    let startLen: number;
    let endLen: number;

    if (minEnd !== undefined) {
      endLen = Math.max(Math.ceil(mid / 2), minEnd);
      startLen = Math.max(0, mid - endLen);
    } else {
      startLen = Math.floor(mid / 2);
      endLen = Math.ceil(mid / 2);
    }

    const startStr = text.slice(0, startLen);
    const endStr = text.slice(-endLen);
    const combinedW = measureText(startStr + endStr, font);

    if (combinedW <= availableForText) lo = mid;
    else hi = mid - 1;
  }

  let startLen: number;
  let endLen: number;

  if (minEnd !== undefined) {
    endLen = Math.max(Math.ceil(lo / 2), minEnd);
    startLen = Math.max(0, lo - endLen);
  } else {
    startLen = Math.floor(lo / 2);
    endLen = Math.ceil(lo / 2);
  }

  return text.slice(0, startLen) + ellipsis + text.slice(-endLen);
}

type BaseProps = React.ComponentPropsWithoutRef<"span"> & {
  children: string;
  ellipsis?: string;
};

export type MiddleTruncationProps = BaseProps &
  (
    | { end: number; minEnd?: never }
    | { minEnd: number; end?: never }
    | { end?: never; minEnd?: never }
  );

export function MiddleTruncation({
  className,
  children,
  end,
  minEnd,
  ellipsis = "...",
  ...props
}: MiddleTruncationProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(children);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recalculate = (width: number) => {
      const font = getComputedFont(el);
      setDisplayed(
        computeTruncated(children, end, minEnd, width, font, ellipsis),
      );
    };

    const debouncedRecalculate = debounceWithRAF(recalculate, 150);

    const ro = new ResizeObserver(([entry]) => {
      debouncedRecalculate(entry.contentRect.width);
    });

    recalculate(el.offsetWidth);
    ro.observe(el);

    return () => ro.disconnect();
  }, [children, end, minEnd, ellipsis]);

  return (
    <span
      ref={containerRef}
      className={cn("block truncate", className)}
      title={children}
      {...props}
    >
      {displayed}
    </span>
  );
}
