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
  const restX = w * 0.5;
  const restY = h * 0.5;

  const targetX = pointer.inside ? pointer.x : restX;
  const targetY = pointer.inside ? pointer.y : restY;
  const targetBend = pointer.inside ? params.hoverBend : params.restBend;

  const follow =
    mode === "magnetic" && pointer.inside
      ? params.follow * 1.6
      : params.follow;

  smooth.x = lerp(smooth.x, targetX, follow);
  smooth.y = lerp(smooth.y, targetY, follow);
  smooth.bend = lerp(smooth.bend, targetBend, follow * 1.15);

  const direction = pointer.inside ? bendDirection : 1;

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
}: {
  mode: RibbonPatternMode;
  className?: string;
  params?: RibbonDialParams;
}) {
  const paramsRef = React.useRef(params);
  paramsRef.current = params;

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

  const syncPointer = (
    e: React.PointerEvent<HTMLCanvasElement>,
    justEntered: boolean,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const prev = pointerRef.current;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const vx = prev.inside && !justEntered ? x - prev.x : 0;

    updateBendDirection(
      bendDirectionRef,
      x,
      vx,
      rect.width,
      justEntered,
    );

    pointerRef.current = { x, y, inside: true, vx };
  };

  const onEnter = (e: React.PointerEvent<HTMLCanvasElement>) => {
    syncPointer(e, true);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    syncPointer(e, false);
  };

  const onLeave = () => {
    pointerRef.current = { x: 0, y: 0, inside: false, vx: 0 };
    bendDirectionRef.current = 1;
  };

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("absolute inset-0 size-full touch-none", className)}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    />
  );
}

export function RibbonFieldDial({
  mode,
  className,
  panel = "Ribbon pattern",
}: {
  mode: RibbonPatternMode;
  className?: string;
  panel?: string;
}) {
  const params = useDialKit(panel, ribbonDialConfig as never) as RibbonDialParams;
  return <RibbonField mode={mode} className={className} params={params} />;
}
