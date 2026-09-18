"use client";

import * as React from "react";
import { animate } from "motion/react";

import type { BrowseItem } from "@/lib/browse/items";
import {
  canvasGridPeriod,
  canvasTileIndex,
  packCanvasColumn,
} from "@/lib/browse/canvas-layout";
import {
  canvasAllowVideo,
  canvasMediaTier,
  canvasMediaWhilePanning,
  capVideoTiles,
} from "@/lib/browse/canvas-media-tier";
import { posterMediaHeight, tileHeight, tileHeightFor } from "@/lib/browse/media";
import { useRenderQuality } from "@/lib/browse/use-render-quality";
import { maxMountedVideos, priorityFromCenter } from "@/lib/browse/video-pool";
import { BrowseCard } from "./glass-card";

type InfiniteCanvasProps = {
  items: BrowseItem[];
  paused?: boolean;
};

type TileSpec = {
  key: string;
  col: number;
  row: number;
  index: number;
  height: number;
  /** video = viewport + four-sided predict ring; image = farther poster overscan. */
  media: "video" | "image";
  /** Quantized playback priority so the pool rebalances as the camera moves. */
  priority: number;
};

/**
 * Camera-space infinite canvas (tldraw / Figma style):
 * tiles sit in world space; the stage takes the camera as one `translate3d`
 * so pan is a single compositor update. Videos play in the viewport plus a
 * four-sided predict ring, so a clip is already running when it comes on
 * screen. Farther overscan is poster-only; beyond that, unmounted.
 */
const DRAG_THRESHOLD = 8;
const MIN_VELOCITY = 0.35;
const COAST_MULTIPLIER = 18;
const SETTLE_MS = 160;
const PAN_SYNC_MS = 80;
const PAN_SYNC_MS_LOW = 200;
/** Four-sided predict ring: start video before the tile hits the viewport. */
const VIDEO_PREDICT = 520;
const VIDEO_PREDICT_LOW = 96;
/** Poster ring beyond predict. */
const IMAGE_OVERSCAN = 880;
const IMAGE_OVERSCAN_LOW = 220;

function mod(value: number, length: number) {
  return ((value % length) + length) % length;
}

function heightsFor(
  list: BrowseItem[],
  cardW: number,
  aspects: Record<string, number>,
) {
  return list.map((item, index) => tileHeightFor(cardW, aspects[item.slug], index));
}

function sameTiles(a: TileSpec[], b: TileSpec[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (
      a[i].key !== b[i].key ||
      a[i].media !== b[i].media ||
      a[i].priority !== b[i].priority
    ) {
      return false;
    }
  }
  return true;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function usePosterAspects(items: BrowseItem[]) {
  const [aspects, setAspects] = React.useState<Record<string, number>>({});
  const key = items.map((item) => `${item.slug}:${item.poster}`).join("|");

  React.useEffect(() => {
    let live = true;
    if (items.length === 0) {
      setAspects({});
      return;
    }

    const next: Record<string, number> = {};
    let pending = items.length;
    const done = () => {
      pending -= 1;
      if (live && pending === 0) setAspects(next);
    };

    for (const item of items) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          next[item.slug] = img.naturalWidth / img.naturalHeight;
        }
        done();
      };
      img.onerror = done;
      img.src = item.poster;
    }

    return () => {
      live = false;
    };
  }, [key]);

  return aspects;
}

export function InfiniteCanvas({ items, paused = false }: InfiniteCanvasProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const tilesRef = React.useRef<TileSpec[]>([]);
  const aspects = usePosterAspects(items);
  const quality = useRenderQuality();

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
  const settleTimer = React.useRef(0);
  const mediaFrozen = React.useRef(false);
  const didCenter = React.useRef(false);
  const lastPanSync = React.useRef(0);
  const wheelSyncRaf = React.useRef(0);

  const [metrics, setMetrics] = React.useState({ cardW: 340, gap: 54 });
  const [tiles, setTiles] = React.useState<TileSpec[]>([]);
  /** True from pan threshold until settle — grab cursor. */
  const [isDragging, setIsDragging] = React.useState(false);

  const cellW = metrics.cardW + metrics.gap;
  const itemCount = items.length;

  const geometry = React.useRef({
    cellW,
    cardW: metrics.cardW,
    gap: metrics.gap,
    count: itemCount,
    heights: [] as number[],
  });
  const packs = React.useRef(
    new Map<number, { prefix: number[]; periodH: number; cols: number; rows: number }>(),
  );

  const getPack = React.useCallback((col: number) => {
    const { count, gap, heights } = geometry.current;
    if (count <= 0) return { prefix: [0], periodH: 1, cols: 1, rows: 1 };
    const { cols } = canvasGridPeriod(count);
    const key = mod(col, cols);
    const cached = packs.current.get(key);
    if (cached) return cached;
    const next = packCanvasColumn(key, count, gap, heights, tileHeight(0));
    packs.current.set(key, next);
    return next;
  }, []);

  const worldY = React.useCallback(
    (col: number, row: number) => {
      const { count } = geometry.current;
      if (count <= 0) return 0;
      const pack = getPack(col);
      const local = mod(row, pack.rows);
      return Math.floor(row / pack.rows) * pack.periodH + pack.prefix[local];
    },
    [getPack],
  );

  const collectVisible = React.useCallback((): TileSpec[] => {
    const { cellW: cw, cardW, count } = geometry.current;
    const { w, h } = size.current;
    if (!w || !h || !count) return [];

    const camX = camera.current.x;
    const camY = camera.current.y;
    const overscan = quality === "low" ? IMAGE_OVERSCAN_LOW : IMAGE_OVERSCAN;
    const predict = quality === "low" ? VIDEO_PREDICT_LOW : VIDEO_PREDICT;
    const viewLeft = -overscan;
    const viewRight = w + overscan;
    const viewTop = -overscan;
    const viewBottom = h + overscan;
    const frozen = mediaFrozen.current;
    const previous = frozen
      ? new Map(tilesRef.current.map((tile) => [tile.key, tile]))
      : null;

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
        for (let local = 0; local < pack.rows; local += 1) {
          const row = cycle * pack.rows + local;
          const index = canvasTileIndex(col, row, count);
          if (index == null) continue;
          const height = geometry.current.heights[index] ?? tileHeight(index);
          const x = col * cw + camX;
          const y = cycle * period + pack.prefix[local] + camY;

          if (x + cardW < viewLeft || x > viewRight) continue;
          if (y + height < viewTop || y > viewBottom) continue;

          const want = canvasMediaTier(x, y, cardW, height, w, h, overscan, predict);
          if (!want) continue;

          const prev = previous?.get(`${col}:${row}`);
          const media = frozen
            ? canvasMediaWhilePanning(want, prev?.media, quality === "low")
            : want;

          const rawPriority =
            media === "video"
              ? priorityFromCenter(x + cardW / 2, y + height / 2, w, h, predict)
              : 0;
          const priority = Math.round(rawPriority / 80) * 80;

          next.push({
            key: `${col}:${row}`,
            col,
            row,
            index,
            height,
            media,
            priority,
          });
        }
      }
    }

    next.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    const mountCap = maxMountedVideos(
      typeof navigator === "undefined" ? undefined : navigator,
      quality === "low",
    );
    return capVideoTiles(next, mountCap);
  }, [getPack, quality]);

  const applyCamera = React.useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.transform = `translate3d(${camera.current.x}px, ${camera.current.y}px, 0)`;
  }, []);

  const setTilesSafe = React.useCallback((next: TileSpec[]) => {
    setTiles((current) => {
      if (sameTiles(current, next)) return current;
      tilesRef.current = next;
      return next;
    });
  }, []);

  const syncVisible = React.useCallback(() => {
    const next = collectVisible();
    applyCamera();
    setTilesSafe(next);
  }, [applyCamera, collectVisible, setTilesSafe]);

  /** Throttled remount during motion so newly visible tiles appear. */
  const syncVisibleThrottled = React.useCallback(() => {
    const gap = quality === "low" ? PAN_SYNC_MS_LOW : PAN_SYNC_MS;
    const now = performance.now();
    if (now - lastPanSync.current < gap) return;
    lastPanSync.current = now;
    syncVisible();
  }, [quality, syncVisible]);

  const markDragging = React.useCallback(() => {
    mediaFrozen.current = true;
    const node = viewportRef.current;
    if (node) node.dataset.dragging = "true";
    setIsDragging(true);
  }, []);

  const scheduleSettle = React.useCallback(() => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      mediaFrozen.current = false;
      const node = viewportRef.current;
      if (node) node.dataset.dragging = "false";
      setIsDragging(false);
      syncVisible();
    }, SETTLE_MS);
  }, [syncVisible]);

  const tickRef = React.useRef<() => void>(() => {});

  // Pan loop: transform every frame; remount posters on a throttle so the field stays filled.
  const tick = React.useCallback(() => {
    applyCamera();
    syncVisibleThrottled();
    frame.current = panning.current ? requestAnimationFrame(() => tickRef.current()) : 0;
  }, [applyCamera, syncVisibleThrottled]);

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
      markDragging();
      const fromX = camera.current.x;
      const fromY = camera.current.y;
      const spring = { type: "spring" as const, duration, bounce };
      let pending = 2;
      const onDone = () => {
        pending -= 1;
        if (pending === 0) scheduleSettle();
      };

      const onX = animate(fromX, toX, {
        ...spring,
        velocity: velocityX,
        onUpdate: (value) => {
          camera.current.x = value;
          applyCamera();
          syncVisibleThrottled();
        },
        onComplete: onDone,
      });
      const onY = animate(fromY, toY, {
        ...spring,
        velocity: velocityY,
        onUpdate: (value) => {
          camera.current.y = value;
          applyCamera();
          syncVisibleThrottled();
        },
        onComplete: onDone,
      });
      coast.current = [onX, onY];
    },
    [stopCoast, markDragging, applyCamera, scheduleSettle, syncVisibleThrottled],
  );

  const springCoast = React.useCallback(() => {
    const speed = Math.hypot(velocity.current.x, velocity.current.y);
    if (speed < MIN_VELOCITY) {
      velocity.current.x = 0;
      velocity.current.y = 0;
      applyCamera();
      scheduleSettle();
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
  }, [springTo, applyCamera, scheduleSettle]);

  React.useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      cancelAnimationFrame(wheelSyncRaf.current);
      window.clearTimeout(settleTimer.current);
      stopCoast();
    },
    [stopCoast],
  );

  useIsomorphicLayoutEffect(() => {
    geometry.current = {
      cellW,
      cardW: metrics.cardW,
      gap: metrics.gap,
      count: itemCount,
      heights: heightsFor(items, metrics.cardW, aspects),
    };
    packs.current.clear();
  }, [cellW, metrics.cardW, metrics.gap, itemCount, items, aspects]);

  useIsomorphicLayoutEffect(() => {
    applyCamera();
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
        camera.current.y =
          (rect.height - tileHeightFor(cardW, aspects[items[0]?.slug ?? ""], 0)) / 2;
        didCenter.current = true;
      }

      geometry.current = {
        cellW: cardW + gap,
        cardW,
        gap,
        count: items.length,
        heights: heightsFor(items, cardW, aspects),
      };
      packs.current.clear();
      setMetrics({ cardW, gap });
      setTilesSafe(collectVisible());
      applyCamera();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [applyCamera, collectVisible, items, aspects, setTilesSafe]);

  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      stopCoast();
      markDragging();
      camera.current.x -= event.deltaX;
      camera.current.y -= event.deltaY;
      velocity.current.x = 0;
      velocity.current.y = 0;
      applyCamera();
      if (!wheelSyncRaf.current) {
        wheelSyncRaf.current = requestAnimationFrame(() => {
          wheelSyncRaf.current = 0;
          syncVisibleThrottled();
        });
      }
      scheduleSettle();
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [stopCoast, markDragging, applyCamera, syncVisibleThrottled, scheduleSettle]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    stopCoast();
    window.clearTimeout(settleTimer.current);
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
      lastPanSync.current = 0;
      markDragging();
      event.currentTarget.setPointerCapture(event.pointerId);
      ensureLoop();
    }

    camera.current.x += dx;
    camera.current.y += dy;
    velocity.current.x = velocity.current.x * 0.55 + dx * 0.45;
    velocity.current.y = velocity.current.y * 0.55 + dy * 0.45;
    applyCamera();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return;
    pointerDown.current = false;
    const didPan = panning.current;
    panning.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (didPan) {
      suppressClick.current = true;
      springCoast();
    } else if (mediaFrozen.current) {
      scheduleSettle();
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
      <div ref={stageRef} className="canvas-stage">
        {tiles.map((tile) => {
          const item = items[tile.index];
          if (!item) return null;
          const x = tile.col * cellW;
          const y = worldY(tile.col, tile.row);
          return (
            <div
              key={tile.key}
              className="canvas-tile"
              style={{
                width: metrics.cardW,
                height: tile.height,
                transform: `translate3d(${x}px, ${y}px, 0)`,
              }}
            >
              <BrowseCard
                item={item}
                index={tile.index}
                eager
                allowVideo={canvasAllowVideo(tile.media)}
                playbackPriority={tile.priority || undefined}
                surface="canvas"
                pinHeight={posterMediaHeight(
                  metrics.cardW,
                  aspects[item.slug],
                  tile.index,
                )}
                className="size-full"
                paused={paused}
              />
            </div>
          );
        })}
      </div>
      <div className="canvas-vignette" />
    </div>
  );
}
