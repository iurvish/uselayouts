"use client";

import * as React from "react";
import { useDialKit } from "dialkit";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  ribbonDefaults,
  ribbonDialConfig,
  type RibbonDialParams,
} from "./ribbon-dial";

export type RibbonPatternMode =
  | "cylinder"
  | "anchor"
  | "magnetic"
  | "ripple"
  | "shear";

type Pointer = { x: number; y: number; inside: boolean; vx: number };

/** px/frame — ignore jitter; only flip bend when movement is deliberate */
const BEND_VX_THRESHOLD = 0.4;

function updateBendDirection(
  direction: { current: number },
  x: number,
  vx: number,
  w: number,
  justEntered: boolean,
) {
  if (justEntered) {
    // Latch entry side: right half → bend left (−1), left half → bend right (+1).
    direction.current = Math.sign(w * 0.5 - x) || 1;
    return;
  }
  if (Math.abs(vx) >= BEND_VX_THRESHOLD) {
    // Moving right → bend right (+1); moving left → bend left (−1).
    direction.current = Math.sign(vx) || direction.current;
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function grain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  alpha: number,
) {
  if (alpha <= 0) return;
  const dots = Math.floor((w * h) / 1100);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let i = 0; i < dots; i++) {
    const x = ((i * 7919) % Math.max(1, Math.floor(w))) + 0.5;
    const y = ((i * 6271) % Math.max(1, Math.floor(h))) + 0.5;
    if ((i * 13) % 5 > 2) ctx.fillRect(x, y, 1, 1);
  }
}

/**
 * Unidirectional Gaussian displacement field centered at (focusX, focusY).
 * offset = direction · bend · sin(πy/h)^p · exp(−dx²/2σx²) · exp(−dy²/2σy²) · strength
 * All lines at a given y shift the same direction; magnitude falls off with distance from cursor.
 * vEnv pins displacement to zero at top/bottom edges.
 */
function gaussianWarpOffset(
  x0: number,
  y: number,
  focusX: number,
  focusY: number,
  w: number,
  h: number,
  bend: number,
  direction: number,
  p: RibbonDialParams,
) {
  const dx = x0 - focusX;
  const dy = y - focusY;

  const sigmaX = Math.max(w * p.warpRadius, 1);
  const sigmaY = Math.max(h * p.verticalSpread, 1);
  const gauss =
    Math.exp(-(dx * dx) / (2 * sigmaX * sigmaX)) *
    Math.exp(-(dy * dy) / (2 * sigmaY * sigmaY));

  const yn = y / h;
  const vEnv = Math.pow(Math.sin(yn * Math.PI), p.curvePower);
  if (vEnv <= 0) return 0;

  return direction * bend * vEnv * gauss * p.warpStrength;
}

function lineDisplacement(
  mode: RibbonPatternMode,
  x0: number,
  y: number,
  u: number,
  focusX: number,
  focusY: number,
  w: number,
  h: number,
  bend: number,
  direction: number,
  pointer: Pointer,
  p: RibbonDialParams,
  t: number,
) {
  const base = gaussianWarpOffset(
    x0,
    y,
    focusX,
    focusY,
    w,
    h,
    bend,
    direction,
    p,
  );

  switch (mode) {
    case "cylinder":
    case "anchor":
      return base;

    case "magnetic": {
      const pull = pointer.inside
        ? lerp(0, (pointer.x - x0) * 0.018, bend / p.hoverBend)
        : 0;
      return base + pull * Math.sin((y / h) * Math.PI);
    }

    case "ripple": {
      if (!pointer.inside) return base * 0.85;
      const r = Math.hypot(x0 - pointer.x, y - pointer.y);
      const wave = Math.sin(r * 0.09 - t * 3.2) * bend * 0.22;
      const damp = Math.exp(-r / (w * 0.28));
      return base + wave * damp * Math.sin((y / h) * Math.PI);
    }

    case "shear": {
      const lean = ((focusX - w * 0.5) / w) * bend * 0.14;
      return base + lean * Math.sin((y / h) * Math.PI);
    }

    default:
      return base;
  }
}

function drawRibbons(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mode: RibbonPatternMode,
  pointer: Pointer,
  smooth: { x: number; y: number; bend: number },
  bendDirection: number,
  params: RibbonDialParams,
  t: number,
) {
  const lines = Math.round(params.lineCount);

  const targetX = pointer.inside ? pointer.x : w * 0.5;
  const targetY = pointer.inside ? pointer.y : h * 0.5;
  const targetBend = pointer.inside ? params.hoverBend : params.restBend;

  const follow =
    mode === "magnetic" && pointer.inside
      ? params.follow * 1.6
      : params.follow;
  const leaveFollow = follow * 0.35;

  smooth.x = lerp(smooth.x, targetX, pointer.inside ? follow : leaveFollow);
  smooth.y = lerp(smooth.y, targetY, pointer.inside ? follow : leaveFollow);
  smooth.bend = lerp(
    smooth.bend,
    targetBend,
    pointer.inside ? follow * 1.15 : leaveFollow,
  );

  const direction = bendDirection;

  for (let i = 0; i < lines; i++) {
    const u = i / (lines - 1);
    const x0 = u * w;
    const lineWidth = lerp(
      params.thickWidth,
      params.thinWidth,
      Math.pow(u, params.widthPower),
    );
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.beginPath();

    for (let y = 0; y <= h; y += 1.1) {
      const offset = lineDisplacement(
        mode,
        x0,
        y,
        u,
        smooth.x,
        smooth.y,
        w,
        h,
        smooth.bend,
        direction,
        pointer,
        params,
        t,
      );
      const x = x0 + offset;
      if (y === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export function RibbonField({
  mode,
  className,
  params = ribbonDefaults,
  boundsRef,
}: {
  mode: RibbonPatternMode;
  className?: string;
  params?: RibbonDialParams;
  /** Pointer hit target — defaults to the canvas container; pass the card root to include padding. */
  boundsRef?: React.RefObject<HTMLElement | null>;
}) {
  const paramsRef = React.useRef(params);
  paramsRef.current = params;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion() ?? false;
  const pointerRef = React.useRef<Pointer>({ x: 0, y: 0, inside: false, vx: 0 });
  const bendDirectionRef = React.useRef(1);
  const smoothRef = React.useRef({
    x: 0,
    y: 0,
    bend: ribbonDefaults.restBend,
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let seeded = false;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!seeded && width > 0) {
        smoothRef.current = {
          x: width * 0.5,
          y: height * 0.5,
          bend: paramsRef.current.restBend,
        };
        seeded = true;
      }
    };

    const frame = (now: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      const t = reduce ? 0 : (now - t0) / 1000;
      ctx.fillStyle = "#1a1a1e";
      ctx.fillRect(0, 0, width, height);
      drawRibbons(
        ctx,
        width,
        height,
        mode,
        pointerRef.current,
        smoothRef.current,
        bendDirectionRef.current,
        paramsRef.current,
        t,
      );
      grain(ctx, width, height, paramsRef.current.grain);
      raf = requestAnimationFrame(frame);
    };

    resize();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode, reduce, params]);

  React.useEffect(() => {
    const hit = boundsRef?.current ?? containerRef.current;
    const canvas = canvasRef.current;
    if (!hit || !canvas) return;

    const syncPointer = (e: PointerEvent, justEntered: boolean) => {
      const canvasRect = canvas.getBoundingClientRect();
      const w = canvasRect.width;
      const h = canvasRect.height;
      if (w <= 0 || h <= 0) return;

      const prev = pointerRef.current;
      const x = clamp(e.clientX - canvasRect.left, 0, w);
      const y = clamp(e.clientY - canvasRect.top, 0, h);
      const vx = prev.inside && !justEntered ? x - prev.x : 0;

      updateBendDirection(bendDirectionRef, x, vx, w, justEntered);
      pointerRef.current = { x, y, inside: true, vx };
    };

    const onEnter = (e: PointerEvent) => syncPointer(e, true);
    const onMove = (e: PointerEvent) => syncPointer(e, false);
    const onLeave = () => {
      pointerRef.current = { ...pointerRef.current, inside: false, vx: 0 };
    };

    hit.addEventListener("pointerenter", onEnter);
    hit.addEventListener("pointermove", onMove);
    hit.addEventListener("pointerleave", onLeave);
    return () => {
      hit.removeEventListener("pointerenter", onEnter);
      hit.removeEventListener("pointermove", onMove);
      hit.removeEventListener("pointerleave", onLeave);
    };
  }, [boundsRef]);

  return (
    <div ref={containerRef} className={cn("absolute inset-0 touch-none", className)}>
      <canvas ref={canvasRef} aria-hidden className="size-full" />
    </div>
  );
}

export function RibbonFieldDial({
  mode,
  className,
  panel = "Ribbon pattern",
  boundsRef,
}: {
  mode: RibbonPatternMode;
  className?: string;
  panel?: string;
  boundsRef?: React.RefObject<HTMLElement | null>;
}) {
  const params = useDialKit(panel, ribbonDialConfig as never) as RibbonDialParams;
  return (
    <RibbonField
      mode={mode}
      className={className}
      params={params}
      boundsRef={boundsRef}
    />
  );
}
