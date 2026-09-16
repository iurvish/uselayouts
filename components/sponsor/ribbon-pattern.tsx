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

/** Rest-state lean — subtle uniform rightward bend when not hovered */
const REST_BEND_DIRECTION = 1;

/** After exit — nudge focus/bend partway toward rest so it doesn't feel frozen */
const SETTLE_CENTER_PULL = 0.18;
const SETTLE_BEND_RETAIN = 0.48;

function updateBendTarget(target: { current: number }, vx: number) {
  if (Math.abs(vx) >= BEND_VX_THRESHOLD) {
    // Only flip when the user is deliberately moving — never on pointerenter.
    target.current = Math.sign(vx) || target.current;
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
  hasInteracted: boolean,
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
      if (!pointer.inside) return hasInteracted ? base : base * 0.85;
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
  smooth: { x: number; y: number; bend: number; direction: number },
  targetDirection: number,
  hasInteracted: boolean,
  settle: { x: number; y: number; bend: number } | null,
  params: RibbonDialParams,
  t: number,
) {
  const lines = Math.round(params.lineCount);

  const follow =
    mode === "magnetic" && pointer.inside
      ? params.follow * 1.6
      : params.follow;

  if (pointer.inside) {
    smooth.x = lerp(smooth.x, pointer.x, follow);
    smooth.y = lerp(smooth.y, pointer.y, follow);
    smooth.bend = lerp(smooth.bend, params.hoverBend, follow * 1.15);
    smooth.direction = lerp(smooth.direction, targetDirection, follow * 0.55);
  } else if (hasInteracted && settle) {
    const settleFollow = follow * 0.32;
    smooth.x = lerp(smooth.x, settle.x, settleFollow);
    smooth.y = lerp(smooth.y, settle.y, settleFollow);
    smooth.bend = lerp(smooth.bend, settle.bend, settleFollow);
  } else if (!hasInteracted) {
    // Snap rest state — no lerp on first paint (smooth starts at 0,0 otherwise).
    smooth.x = w * 0.5;
    smooth.y = h * 0.5;
    smooth.bend = params.restBend;
    smooth.direction = REST_BEND_DIRECTION;
  }

  const focusX = hasInteracted ? smooth.x : w * 0.5;
  const focusY = hasInteracted ? smooth.y : h * 0.5;
  const direction = hasInteracted ? smooth.direction : REST_BEND_DIRECTION;
  const warpParams = !hasInteracted
    ? { ...params, warpRadius: params.warpRadius * 1.22 }
    : params;

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
        focusX,
        focusY,
        w,
        h,
        smooth.bend,
        direction,
        pointer,
        hasInteracted,
        warpParams,
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
  const targetDirectionRef = React.useRef(REST_BEND_DIRECTION);
  const hasInteractedRef = React.useRef(false);
  const settleRef = React.useRef<{ x: number; y: number; bend: number } | null>(
    null,
  );
  const smoothRef = React.useRef({
    x: 0,
    y: 0,
    bend: ribbonDefaults.restBend,
    direction: REST_BEND_DIRECTION,
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
      if (width > 0 && height > 0) {
        if (!seeded) {
          seeded = true;
        }
        if (!pointerRef.current.inside && !hasInteractedRef.current) {
          smoothRef.current.x = width * 0.5;
          smoothRef.current.y = height * 0.5;
          smoothRef.current.bend = paramsRef.current.restBend;
          smoothRef.current.direction = REST_BEND_DIRECTION;
        }
      }
    };

    const frame = (now: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width <= 0 || height <= 0) {
        raf = requestAnimationFrame(frame);
        return;
      }
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
        targetDirectionRef.current,
        hasInteractedRef.current,
        settleRef.current,
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

    const syncPointer = (e: PointerEvent) => {
      const canvasRect = canvas.getBoundingClientRect();
      const w = canvasRect.width;
      const h = canvasRect.height;
      if (w <= 0 || h <= 0) return;

      const prev = pointerRef.current;
      const x = clamp(e.clientX - canvasRect.left, 0, w);
      const y = clamp(e.clientY - canvasRect.top, 0, h);
      const vx = prev.inside ? x - prev.x : 0;

      updateBendTarget(targetDirectionRef, vx);
      hasInteractedRef.current = true;
      pointerRef.current = { x, y, inside: true, vx };
    };

    const onEnter = (e: PointerEvent) => syncPointer(e);
    const onMove = (e: PointerEvent) => syncPointer(e);
    const onLeave = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const w = canvasRect.width;
      const h = canvasRect.height;
      const p = paramsRef.current;
      const ptr = pointerRef.current;

      if (w > 0 && h > 0) {
        settleRef.current = {
          x: ptr.x + (w * 0.5 - ptr.x) * SETTLE_CENTER_PULL,
          y: ptr.y + (h * 0.5 - ptr.y) * SETTLE_CENTER_PULL,
          bend:
            p.restBend + (p.hoverBend - p.restBend) * SETTLE_BEND_RETAIN,
        };
      }

      pointerRef.current = { ...ptr, inside: false, vx: 0 };
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
