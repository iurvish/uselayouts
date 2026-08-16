"use client";

import * as React from "react";
import { animate } from "motion/react";

import type { BrowseItem } from "@/lib/browse/items";
import { MEDIA_HEIGHTS, mediaHeight } from "@/lib/browse/media";
import { BrowseCard, type MediaMode } from "./glass-card";

type InfiniteCanvasProps = {
  items: BrowseItem[];
  mediaMode: MediaMode;
};

type Range = { c0: number; c1: number; r0: number; r1: number };

const MIN_VELOCITY = 0.35;
const DRAG_THRESHOLD = 6;
const COAST_MULTIPLIER = 18;

function mod(value: number, length: number) {
  return ((value % length) + length) % length;
}

function packColumn(col: number, count: number, gap: number) {
  const prefix = Array<number>(count + 1);
  prefix[0] = 0;
  for (let row = 0; row < count; row += 1) {
    prefix[row + 1] = prefix[row] + mediaHeight(mod(col * 7 + row * 3, count)) + gap;
  }
  return { prefix, periodH: prefix[count] };
}

const MIN_MEDIA = Math.min(...MEDIA_HEIGHTS);
const MAX_MEDIA = Math.max(...MEDIA_HEIGHTS);

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * A grid that never ends: only the cells overlapping the viewport are mounted,
 * and their indices wrap back into the item list. Panning writes transforms
 * straight to the DOM; after a flick, Motion springs the offset to rest.
 */
export function InfiniteCanvas({ items, mediaMode }: InfiniteCanvasProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const tiles = React.useRef(new Map<string, HTMLDivElement>());

  const offset = React.useRef({ x: 0, y: 0 });
  const velocity = React.useRef({ x: 0, y: 0 });
  const lastPointer = React.useRef({ x: 0, y: 0 });
  const travelled = React.useRef(0);
  const dragging = React.useRef(false);
  const suppressClick = React.useRef(false);
  const size = React.useRef({ w: 0, h: 0 });
  const frame = React.useRef(0);
  const coast = React.useRef<{ stop: () => void }[]>([]);

  const [metrics, setMetrics] = React.useState({ cardW: 340, gap: 88 });
  const [range, setRange] = React.useState<Range>({ c0: -2, c1: 2, r0: -1, r1: 1 });
  const [isDragging, setIsDragging] = React.useState(false);
  const didCenter = React.useRef(false);

  const cellW = metrics.cardW + metrics.gap;
  const itemCount = items.length;

  const geometry = React.useRef({
    cellW,
    cardW: metrics.cardW,
    gap: metrics.gap,
    count: itemCount,
  });
  const packs = React.useRef(new Map<number, { prefix: number[]; periodH: number }>());

  const getPack = React.useCallback((col: number) => {
    const { count, gap } = geometry.current;
    if (count <= 0) return { prefix: [0], periodH: 1 };
    const key = mod(col, count);
    const cached = packs.current.get(key);
    if (cached) return cached;
    const next = packColumn(key, count, gap);
    packs.current.set(key, next);
    return next;
  }, []);

  const slotY = React.useCallback(
    (col: number, row: number) => {
      const { count } = geometry.current;
      if (count <= 0) return 0;
      const pack = getPack(col);
      return Math.floor(row / count) * pack.periodH + pack.prefix[mod(row, count)];
    },
    [getPack],
  );

  const computeRange = React.useCallback((): Range => {
    const { cellW: cw, gap } = geometry.current;
    const { w, h } = size.current;
    const { x, y } = offset.current;
    const minH = MIN_MEDIA + gap;
    const maxH = MAX_MEDIA + gap;

    return {
      c0: Math.floor((-x - cw) / cw),
      c1: Math.ceil((w - x + cw) / cw),
      r0: Math.floor((-y - maxH) / minH) - 1,
      r1: Math.ceil((h - y + maxH) / minH) + 1,
    };
  }, []);

  const applyTransforms = React.useCallback(() => {
    const { cellW: cw, cardW, count } = geometry.current;
    const { w, h } = size.current;
    if (!w || !h || !count) return;

    const halfW = w / 2;
    const halfH = h / 2;

    tiles.current.forEach((node, key) => {
      const [col, row] = key.split(":").map(Number);
      const index = mod(col * 7 + row * 3, count);
      const height = mediaHeight(index);
      const x = col * cw + offset.current.x;
      const y = slotY(col, row) + offset.current.y;

      const cx = x + cardW / 2 - halfW;
      const cy = y + height / 2 - halfH;
      const dist = (cx * cx) / (halfW * halfW) + (cy * cy) / (halfH * halfH);
      const fade = dist > 1.85 ? Math.max(0, 1 - (dist - 1.85) * 1.2) : 1;

      node.style.height = `${height}px`;
      node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      node.style.opacity = fade.toFixed(3);
    });
  }, [slotY]);

  const syncRange = React.useCallback(() => {
    const next = computeRange();
    setRange((current) =>
      current.c0 === next.c0 && current.c1 === next.c1 && current.r0 === next.r0 && current.r1 === next.r1
        ? current
        : next,
    );
    applyTransforms();
  }, [applyTransforms, computeRange]);

  const tickRef = React.useRef<() => void>(() => {});

  const tick = React.useCallback(() => {
    syncRange();
    frame.current = dragging.current ? requestAnimationFrame(() => tickRef.current()) : 0;
  }, [syncRange]);

  React.useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const ensureLoop = React.useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(() => tickRef.current());
  }, []);

  const stopCoast = React.useCallback(() => {
    coast.current.forEach((control) => control.stop());
    coast.current = [];
  }, []);

  const springTo = React.useCallback(
    (toX: number, toY: number, { duration = 0.7, bounce = 0.16, velocityX = 0, velocityY = 0 } = {}) => {
      stopCoast();
      const fromX = offset.current.x;
      const fromY = offset.current.y;
      const spring = { type: "spring" as const, duration, bounce };

      const onX = animate(fromX, toX, {
        ...spring,
        velocity: velocityX,
        onUpdate: (value) => {
          offset.current.x = value;
          syncRange();
        },
      });
      const onY = animate(fromY, toY, {
        ...spring,
        velocity: velocityY,
        onUpdate: (value) => {
          offset.current.y = value;
          syncRange();
        },
      });
      coast.current = [onX, onY];
    },
    [stopCoast, syncRange],
  );

  const springCoast = React.useCallback(() => {
    const speed = Math.hypot(velocity.current.x, velocity.current.y);
    if (speed < MIN_VELOCITY) {
      velocity.current.x = 0;
      velocity.current.y = 0;
      return;
    }

    const vx = velocity.current.x;
    const vy = velocity.current.y;
    const toX = offset.current.x + vx * COAST_MULTIPLIER;
    const toY = offset.current.y + vy * COAST_MULTIPLIER;
    velocity.current.x = 0;
    velocity.current.y = 0;
    springTo(toX, toY, { duration: 0.7, bounce: 0.16, velocityX: vx, velocityY: vy });
  }, [springTo]);

  React.useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      stopCoast();
    },
    [stopCoast],
  );

  useIsomorphicLayoutEffect(() => {
    geometry.current = { cellW, cardW: metrics.cardW, gap: metrics.gap, count: itemCount };
    packs.current.clear();
  }, [cellW, metrics.cardW, metrics.gap, itemCount]);

  useIsomorphicLayoutEffect(() => {
    applyTransforms();
  });

  useIsomorphicLayoutEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      size.current = { w: rect.width, h: rect.height };
      if (!rect.width || !rect.height) return;

      const cardW = Math.round(Math.min(380, Math.max(260, rect.width * 0.28)));
      const gap = Math.round(Math.max(56, cardW * 0.22));

      if (!didCenter.current) {
        offset.current.x = (rect.width - cardW) / 2;
        offset.current.y = (rect.height - mediaHeight(0)) / 2;
        didCenter.current = true;
      }

      geometry.current = { cellW: cardW + gap, cardW, gap, count: items.length };
      packs.current.clear();
      setMetrics({ cardW, gap });
      setRange(computeRange());
      applyTransforms();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [applyTransforms, computeRange]);

  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      stopCoast();
      offset.current.x -= event.deltaX;
      offset.current.y -= event.deltaY;
      velocity.current.x = 0;
      velocity.current.y = 0;
      syncRange();
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [stopCoast, syncRange]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    stopCoast();
    dragging.current = true;
    setIsDragging(true);
    travelled.current = 0;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    velocity.current = { x: 0, y: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    ensureLoop();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = event.clientX - lastPointer.current.x;
    const dy = event.clientY - lastPointer.current.y;
    lastPointer.current = { x: event.clientX, y: event.clientY };

    offset.current.x += dx;
    offset.current.y += dy;
    travelled.current += Math.abs(dx) + Math.abs(dy);
    velocity.current.x = velocity.current.x * 0.55 + dx * 0.45;
    velocity.current.y = velocity.current.y * 0.55 + dy * 0.45;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    suppressClick.current = travelled.current > DRAG_THRESHOLD;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    springCoast();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 420 : 180;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    velocity.current.x = 0;
    velocity.current.y = 0;
    springTo(offset.current.x + move[0], offset.current.y + move[1], { duration: 0.4, bounce: 0 });
  };

  const centreCol = Math.round((range.c0 + range.c1) / 2);
  const centreRow = Math.round((range.r0 + range.r1) / 2);

  const cells: React.ReactNode[] = [];
  for (let col = range.c0; col <= range.c1; col += 1) {
    for (let row = range.r0; row <= range.r1; row += 1) {
      const key = `${col}:${row}`;
      const index = itemCount ? mod(col * 7 + row * 3, itemCount) : 0;
      const height = mediaHeight(index);

      cells.push(
        <div
          key={key}
          className="canvas-tile"
          style={{ width: metrics.cardW, height }}
          ref={(node) => {
            if (node) tiles.current.set(key, node);
            else tiles.current.delete(key);
          }}
        >
          <BrowseCard
            item={items[index]}
            index={index}
            mediaMode={mediaMode}
            eager={Math.abs(col - centreCol) <= 1 && Math.abs(row - centreRow) <= 1}
            className="size-full"
          />
        </div>,
      );
    }
  }

  return (
    <div
      ref={viewportRef}
      className="canvas-viewport"
      data-dragging={isDragging}
      role="application"
      aria-label="Infinite component canvas. Drag to explore, arrow keys to pan."
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className="canvas-stage">{cells}</div>
      <div className="canvas-vignette" />
    </div>
  );
}
