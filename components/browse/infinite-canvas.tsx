"use client";

import * as React from "react";
import { animate } from "motion/react";

import type { BrowseItem } from "@/lib/browse/items";
import { mediaHeight } from "@/lib/browse/media";
import { BrowseCard } from "./glass-card";

type InfiniteCanvasProps = {
  items: BrowseItem[];
};

type TileSpec = {
  key: string;
  col: number;
  row: number;
  index: number;
  height: number;
};

/**
 * Camera-space infinite canvas (tldraw / Figma style):
 * world positions live on a masonry column grid; a camera offset is added in
 * `translate3d`. Only tiles whose AABB overlaps the viewport (+ overscan) are
 * mounted. Pan follows the pointer 1:1; clicks are preserved until the drag
 * threshold, then pointer capture starts.
 */
const DRAG_THRESHOLD = 8;
const MIN_VELOCITY = 0.35;
const COAST_MULTIPLIER = 18;
const OVERSCAN = 280;

function mod(value: number, length: number) {
  return ((value % length) + length) % length;
}

function tileIndex(col: number, row: number, count: number) {
  return mod(col * 7 + row * 3, count);
}

function packColumn(col: number, count: number, gap: number) {
  const prefix = Array<number>(count + 1);
  prefix[0] = 0;
  for (let row = 0; row < count; row += 1) {
    prefix[row + 1] = prefix[row] + mediaHeight(tileIndex(col, row, count)) + gap;
  }
  return { prefix, periodH: prefix[count] };
}

function sameTiles(a: TileSpec[], b: TileSpec[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].key !== b[i].key) return false;
  }
  return true;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export function InfiniteCanvas({ items }: InfiniteCanvasProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const nodes = React.useRef(new Map<string, HTMLDivElement>());

  const camera = React.useRef({ x: 0, y: 0 });
  const velocity = React.useRef({ x: 0, y: 0 });
  const lastPointer = React.useRef({ x: 0, y: 0 });
  const travelled = React.useRef(0);
  const pointerDown = React.useRef(false);
  const panning = React.useRef(false);
  const suppressClick = React.useRef(false);
  const size = React.useRef({ w: 0, h: 0 });
  const frame = React.useRef(0);
  const coast = React.useRef<{ stop: () => void }[]>([]);
  const didCenter = React.useRef(false);

  const [metrics, setMetrics] = React.useState({ cardW: 340, gap: 54 });
  const [tiles, setTiles] = React.useState<TileSpec[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

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

  const worldY = React.useCallback(
    (col: number, row: number) => {
      const { count } = geometry.current;
      if (count <= 0) return 0;
      const pack = getPack(col);
      const local = mod(row, count);
      return Math.floor(row / count) * pack.periodH + pack.prefix[local];
    },
    [getPack],
  );

  const collectVisible = React.useCallback((): TileSpec[] => {
    const { cellW: cw, cardW, count } = geometry.current;
    const { w, h } = size.current;
    if (!w || !h || !count) return [];

    const camX = camera.current.x;
    const camY = camera.current.y;
    const viewLeft = -OVERSCAN;
    const viewRight = w + OVERSCAN;
    const viewTop = -OVERSCAN;
    const viewBottom = h + OVERSCAN;

    const c0 = Math.floor((viewLeft - camX - cardW) / cw);
    const c1 = Math.ceil((viewRight - camX) / cw);

    const next: TileSpec[] = [];

    for (let col = c0; col <= c1; col += 1) {
      const pack = getPack(col);
      const period = Math.max(pack.periodH, 1);
      const worldTop = viewTop - camY;
      const worldBottom = viewBottom - camY;
      const k0 = Math.floor(worldTop / period) - 1;
      const k1 = Math.floor(worldBottom / period) + 1;

      for (let cycle = k0; cycle <= k1; cycle += 1) {
        for (let local = 0; local < count; local += 1) {
          const row = cycle * count + local;
          const index = tileIndex(col, row, count);
          const height = mediaHeight(index);
          const x = col * cw + camX;
          const y = cycle * period + pack.prefix[local] + camY;

          if (x + cardW < viewLeft || x > viewRight) continue;
          if (y + height < viewTop || y > viewBottom) continue;

          next.push({ key: `${col}:${row}`, col, row, index, height });
        }
      }
    }

    next.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    return next;
  }, [getPack]);

  const applyTransforms = React.useCallback(() => {
    const { cellW: cw, cardW } = geometry.current;
    nodes.current.forEach((node, key) => {
      const [col, row] = key.split(":").map(Number);
      const x = col * cw + camera.current.x;
      const y = worldY(col, row) + camera.current.y;
      node.style.width = `${cardW}px`;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, [worldY]);

  const syncVisible = React.useCallback(() => {
    const next = collectVisible();
    applyTransforms();
    setTiles((current) => (sameTiles(current, next) ? current : next));
  }, [applyTransforms, collectVisible]);

  const tickRef = React.useRef<() => void>(() => {});

  const tick = React.useCallback(() => {
    syncVisible();
    frame.current = panning.current ? requestAnimationFrame(() => tickRef.current()) : 0;
  }, [syncVisible]);

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
      const fromX = camera.current.x;
      const fromY = camera.current.y;
      const spring = { type: "spring" as const, duration, bounce };

      const onX = animate(fromX, toX, {
        ...spring,
        velocity: velocityX,
        onUpdate: (value) => {
          camera.current.x = value;
          syncVisible();
        },
      });
      const onY = animate(fromY, toY, {
        ...spring,
        velocity: velocityY,
        onUpdate: (value) => {
          camera.current.y = value;
          syncVisible();
        },
      });
      coast.current = [onX, onY];
    },
    [stopCoast, syncVisible],
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
    velocity.current.x = 0;
    velocity.current.y = 0;
    springTo(camera.current.x + vx * COAST_MULTIPLIER, camera.current.y + vy * COAST_MULTIPLIER, {
      duration: 0.7,
      bounce: 0.16,
      velocityX: vx,
      velocityY: vy,
    });
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
      const gap = Math.round(Math.max(40, cardW * 0.16));

      if (!didCenter.current) {
        camera.current.x = (rect.width - cardW) / 2;
        camera.current.y = (rect.height - mediaHeight(0)) / 2;
        didCenter.current = true;
      }

      geometry.current = { cellW: cardW + gap, cardW, gap, count: items.length };
      packs.current.clear();
      setMetrics({ cardW, gap });
      setTiles(collectVisible());
      applyTransforms();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [applyTransforms, collectVisible, items.length]);

  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      stopCoast();
      camera.current.x -= event.deltaX;
      camera.current.y -= event.deltaY;
      velocity.current.x = 0;
      velocity.current.y = 0;
      syncVisible();
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [stopCoast, syncVisible]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    stopCoast();
    pointerDown.current = true;
    panning.current = false;
    travelled.current = 0;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    velocity.current = { x: 0, y: 0 };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return;
    const dx = event.clientX - lastPointer.current.x;
    const dy = event.clientY - lastPointer.current.y;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    travelled.current += Math.hypot(dx, dy);

    if (!panning.current) {
      if (travelled.current < DRAG_THRESHOLD) return;
      panning.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      ensureLoop();
    }

    camera.current.x += dx;
    camera.current.y += dy;
    velocity.current.x = velocity.current.x * 0.55 + dx * 0.45;
    velocity.current.y = velocity.current.y * 0.55 + dy * 0.45;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return;
    pointerDown.current = false;
    const didPan = panning.current;
    panning.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (didPan) {
      suppressClick.current = true;
      springCoast();
    }
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
    springTo(camera.current.x + move[0], camera.current.y + move[1], { duration: 0.4, bounce: 0 });
  };

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
      <div className="canvas-stage">
        {tiles.map((tile) => {
          const item = items[tile.index];
          if (!item) return null;
          const x = tile.col * cellW + camera.current.x;
          const y = worldY(tile.col, tile.row) + camera.current.y;
          return (
            <div
              key={tile.key}
              className="canvas-tile"
              style={{
                width: metrics.cardW,
                height: tile.height,
                transform: `translate3d(${x}px, ${y}px, 0)`,
              }}
              ref={(node) => {
                if (node) nodes.current.set(tile.key, node);
                else nodes.current.delete(tile.key);
              }}
            >
              <BrowseCard
                item={item}
                index={tile.index}
                eager
                className="size-full"
              />
            </div>
          );
        })}
      </div>
      <div className="canvas-vignette" />
    </div>
  );
}
