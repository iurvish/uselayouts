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

type Pointer = { x: number; y: number; inside: boolean };

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
 * Cylindrical lens centered at focus — lines bulge away from the focal point.
 * offset = bend · sin(πy/h)^p · (dx/lensR) · exp(−(dx/lensR)²/f) · sharp · gain
 * dx = x0 − focusX — left of focus shifts left, right of focus shifts right
 */
function arcLensOffset(
  x0: number,
  y: number,
  focusX: number,
  w: number,
  h: number,
  bend: number,
  p: RibbonDialParams,
) {
  const yn = y / h;
  const vEnv = Math.pow(Math.sin(yn * Math.PI), p.curvePower);
  if (vEnv <= 0) return 0;

  const lensR = w * p.lensWidth * 0.5;
  const dx = x0 - focusX;
  const normDx = dx / Math.max(lensR, 1);
  const bump = Math.exp(
    -(normDx * normDx) / Math.max(p.arcFalloff, 0.01),
  );

  return bend * vEnv * normDx * bump * p.arcSharpness * p.arcGain;
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
  pointer: Pointer,
  p: RibbonDialParams,
  t: number,
) {
  const base = arcLensOffset(x0, y, focusX, w, h, bend, p);

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
  params: RibbonDialParams,
  t: number,
) {
  const lines = Math.round(params.lineCount);
  const restX = params.restFocusX * w;
  const restY = 0.5 * h;

  const targetX = pointer.inside ? pointer.x : restX;
  const targetY = restY;
  const targetBend = pointer.inside ? params.hoverBend : params.restBend;

  const follow =
    mode === "magnetic" && pointer.inside
      ? params.follow * 1.6
      : params.follow;

  smooth.x = lerp(smooth.x, targetX, follow);
  smooth.y = lerp(smooth.y, targetY, follow * 0.85);
  smooth.bend = lerp(smooth.bend, targetBend, follow * 1.15);

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
  const pointerRef = React.useRef<Pointer>({ x: 0, y: 0, inside: false });
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
          x: width * paramsRef.current.restFocusX,
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

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      inside: true,
    };
  };

  const onLeave = () => {
    pointerRef.current.inside = false;
  };

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("absolute inset-0 size-full touch-none", className)}
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
