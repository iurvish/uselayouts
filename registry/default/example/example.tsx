import React, { useRef, useState, useEffect, useCallback, useId } from "react";
import { cn } from "@/lib/utils";

export type StretchyButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "dark"
  | "emerald"
  | "purple"
  | "amber"
  | "gradient";

export type StretchyButtonSize = "sm" | "default" | "lg" | "xl";

export interface StretchyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: StretchyButtonVariant;
  size?: StretchyButtonSize;
  /** Spring stiffness coefficient (default: 360) */
  stiffness?: number;
  /** Spring damping coefficient (default: 14) */
  damping?: number;
  /** Spring mass (default: 1) */
  mass?: number;
  /** Maximum stretch distance in pixels (default: 550 for massive screen-wide stretch) */
  maxStretch?: number;
  /** Enable dragging from anywhere on the interface/screen (default: true) */
  fullInterface?: boolean;
  /** Custom SVG fill color */
  fillColor?: string;
  /** Optional stroke border color */
  strokeColor?: string;
  /** Optional stroke border width */
  strokeWidth?: number;
  /** Custom width override in pixels */
  customWidth?: number;
  /** Custom height override in pixels */
  customHeight?: number;
  /** Callback fired continuously while stretching with physics metrics */
  onStretch?: (metrics: {
    dx: number;
    dy: number;
    distance: number;
    angle: number;
    /** Screen-space (client) position of the stretched tip */
    tip: { x: number; y: number };
  }) => void;
  /** Callback fired upon releasing the stretch */
  onRelease?: (metrics: {
    dx: number;
    dy: number;
    velocity: { x: number; y: number };
    /** Screen-space (client) position of the stretched tip */
    tip: { x: number; y: number };
  }) => void;
}

interface Point {
  x: number;
  y: number;
}

// Convert Catmull-Rom closed spline through perimeter vertices to smooth SVG cubic Bezier path
function catmullRomToBezier(points: Point[], tension = 0.5): string {
  const n = points.length;
  if (n < 3) return "";

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const cp1x = p1.x + (p2.x - p0.x) / (6 * tension);
    const cp1y = p1.y + (p2.y - p0.y) / (6 * tension);
    const cp2x = p2.x - (p3.x - p1.x) / (6 * tension);
    const cp2y = p2.y - (p3.y - p1.y) / (6 * tension);

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d + " Z";
}

// Open spline for the centerline (used by SVG textPath)
function openSplineToBezier(points: Point[], tension = 0.5): string {
  const n = points.length;
  if (n < 2) return "";
  if (n === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < n - 2 ? points[i + 2] : p2;
    const cp1x = p1.x + (p2.x - p0.x) / (6 * tension);
    const cp1y = p1.y + (p2.y - p0.y) / (6 * tension);
    const cp2x = p2.x - (p3.x - p1.x) / (6 * tension);
    const cp2y = p2.y - (p3.y - p1.y) / (6 * tension);
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// Generate base perimeter points for a capsule / rounded pill
function getCapsulePoints(width: number, height: number, count = 48): Point[] {
  const r = height / 2;
  const straightLen = Math.max(0, width - 2 * r);
  const halfStraight = straightLen / 2;
  const arcLen = Math.PI * r;
  const totalPerimeter = 2 * straightLen + 2 * arcLen;

  const points: Point[] = [];

  for (let i = 0; i < count; i++) {
    const s = (i / count) * totalPerimeter;
    let x = 0;
    let y = 0;

    if (s < straightLen) {
      x = -halfStraight + s;
      y = -r;
    } else if (s < straightLen + arcLen) {
      const arcS = s - straightLen;
      const theta = -Math.PI / 2 + (arcS / arcLen) * Math.PI;
      x = halfStraight + r * Math.cos(theta);
      y = r * Math.sin(theta);
    } else if (s < 2 * straightLen + arcLen) {
      const bottomS = s - (straightLen + arcLen);
      x = halfStraight - bottomS;
      y = r;
    } else {
      const arcS = s - (2 * straightLen + arcLen);
      const theta = Math.PI / 2 + (arcS / arcLen) * Math.PI;
      x = -halfStraight + r * Math.cos(theta);
      y = r * Math.sin(theta);
    }

    points.push({ x, y });
  }

  return points;
}

// Generate base centerline points from left to right along y = 0
function getCenterlinePoints(width: number, height: number, count = 24): Point[] {
  const points: Point[] = [];
  const r = height / 2;
  const startX = -width / 2 + r * 0.4;
  const endX = width / 2 - r * 0.4;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    points.push({ x: startX + t * (endX - startX), y: 0 });
  }
  return points;
}

// Exact closest point calculation on any 2D capsule from arbitrary point (px, py)
function getClosestCapsulePoint(px: number, py: number, width: number, height: number): Point {
  const r = height / 2;
  const straight = Math.max(0, width - 2 * r);
  const halfS = straight / 2;

  const segX = Math.max(-halfS, Math.min(halfS, px));
  const segY = 0;
  const vx = px - segX;
  const vy = py - segY;
  const dist = Math.hypot(vx, vy);

  if (dist <= r) {
    return { x: px, y: py };
  }
  return {
    x: segX + (vx / dist) * r,
    y: segY + (vy / dist) * r,
  };
}

// Physics-driven 2D elastic deformation mapping with support for massive screen-wide stretch
function deformPoint(
  pt: Point,
  grab: Point,
  delta: Point,
  width: number,
  height: number,
  pressDepth = 0
): Point {
  const halfW = width / 2;
  const halfH = height / 2;

  const u = pt.x / halfW;
  const v = pt.y / halfH;
  const gu = Math.max(-1, Math.min(1, grab.x / halfW));

  let dx = 0;
  let dy = 0;

  // 1. Horizontal Stretch, Poisson Necking, and Flaring (delta.x)
  if (Math.abs(delta.x) > 0.0001) {
    if (delta.x > 0) {
      // Pulling to the right: left cap anchored, right cap extends
      const stretchFactor = Math.pow(Math.max(0, (u + 1) / 2), 1.25);
      dx += delta.x * (0.04 + 0.96 * stretchFactor);

      // Waist pinches inward (clamped so it never inverts on massive stretch)
      const waist = Math.max(0, 1 - u * u);
      const maxWaistPinch = halfH * 0.62;
      const rawWaistPinch = Math.abs(delta.x) * 0.14 * waist;
      const waistPinch = Math.min(maxWaistPinch, rawWaistPinch);
      dy -= v * waistPinch;

      // Trumpet flaring at pulled right tip
      if (u > 0.35) {
        const flareRatio = Math.min(1.2, Math.abs(delta.x) / halfW);
        const flare = Math.pow((u - 0.35) / 0.65, 2) * flareRatio * 0.16;
        dy += v * Math.abs(delta.x) * flare;
      }
    } else {
      // Pulling to the left: right cap anchored, left cap extends
      const stretchFactor = Math.pow(Math.max(0, (1 - u) / 2), 1.25);
      dx += delta.x * (0.04 + 0.96 * stretchFactor);

      const waist = Math.max(0, 1 - u * u);
      const maxWaistPinch = halfH * 0.62;
      const rawWaistPinch = Math.abs(delta.x) * 0.14 * waist;
      const waistPinch = Math.min(maxWaistPinch, rawWaistPinch);
      dy -= v * waistPinch;

      // Trumpet flaring at pulled left tip
      if (u < -0.35) {
        const flareRatio = Math.min(1.2, Math.abs(delta.x) / halfW);
        const flare = Math.pow((-u - 0.35) / 0.65, 2) * flareRatio * 0.16;
        dy += v * Math.abs(delta.x) * flare;
      }
    }
  }

  // 2. Vertical Beam Bending (delta.y) -> Banana / Smile Curve
  if (Math.abs(delta.y) > 0.0001) {
    const distU = Math.abs(u - gu);
    const bendProfile = Math.max(0, 1 - 0.62 * Math.pow(distU, 1.45));

    if (delta.y > 0) {
      // Pulling down: bottom edge bows fully, top edge bows along
      const edgeWeight = 0.66 + 0.34 * ((v + 1) / 2);
      dy += delta.y * bendProfile * edgeWeight;

      const tilt = u * (v * 0.18) * Math.min(1.4, delta.y / halfH);
      dx -= tilt * (halfH * 0.22);
    } else {
      // Pulling up: top edge bows fully, bottom edge bows along
      const edgeWeight = 0.66 + 0.34 * ((1 - v) / 2);
      dy += delta.y * bendProfile * edgeWeight;

      const tilt = u * (v * 0.18) * Math.min(1.4, -delta.y / halfH);
      dx -= tilt * (halfH * 0.22);
    }
  }

  // 3. Local Surface Tenting near grab point
  const distGrab = Math.hypot(pt.x - grab.x, pt.y - grab.y);
  const grabRadius = Math.max(halfH * 1.5, 75);
  if (distGrab < grabRadius) {
    const tentFactor = Math.pow(1 - distGrab / grabRadius, 2) * 0.22;
    dx += delta.x * tentFactor;
    dy += delta.y * tentFactor;
  }

  // 4. Tactile press depth indentation
  if (pressDepth > 0 && distGrab < grabRadius) {
    const indent = Math.pow(1 - distGrab / grabRadius, 2) * pressDepth;
    dx -= (grab.x / halfW) * indent;
    dy -= (grab.y / halfH) * indent;
  }

  return {
    x: pt.x + dx,
    y: pt.y + dy,
  };
}

const variantStyles: Record<
  StretchyButtonVariant,
  {
    fill: string;
    text: string;
    shadow: string;
    stroke?: string;
    gradient?: boolean;
    gradientColors?: [string, string];
  }
> = {
  default: {
    fill: "#6366F1",
    text: "text-white",
    shadow: "none",
  },
  secondary: {
    fill: "#F1F5F9",
    text: "text-slate-900 dark:text-slate-100",
    shadow: "none",
    stroke: "#CBD5E1",
  },
  destructive: {
    fill: "#EF4444",
    text: "text-white",
    shadow: "none",
  },
  outline: {
    fill: "rgba(255, 255, 255, 0.9)",
    text: "text-neutral-900 dark:text-neutral-100",
    shadow: "none",
    stroke: "#94A3B8",
  },
  ghost: {
    fill: "rgba(241, 245, 249, 0.6)",
    text: "text-slate-700 dark:text-slate-200",
    shadow: "none",
  },
  dark: {
    fill: "#0F172A",
    text: "text-white",
    shadow: "none",
    stroke: "#334155",
  },
  emerald: {
    fill: "#10B981",
    text: "text-white",
    shadow: "none",
  },
  purple: {
    fill: "#8B5CF6",
    text: "text-white",
    shadow: "none",
  },
  amber: {
    fill: "#F59E0B",
    text: "text-white",
    shadow: "none",
  },
  gradient: {
    fill: "url(#stretchy-grad)",
    text: "text-white",
    shadow: "none",
    gradient: true,
    gradientColors: ["#3F9CFF", "#8B5CF6"],
  },
};

// Generous, prominent button sizes
// Prominent, large button sizes so users can see the button and interactions clearly
const sizeDimensions: Record<
  StretchyButtonSize,
  { width: number; height: number; fontSize: number; textClass: string }
> = {
  sm: { width: 380, height: 118, fontSize: 36, textClass: "text-[36px] font-normal" },
  default: { width: 540, height: 168, fontSize: 52, textClass: "text-[52px] font-normal tracking-wide" },
  lg: { width: 640, height: 196, fontSize: 62, textClass: "text-[62px] font-medium" },
  xl: { width: 760, height: 232, fontSize: 74, textClass: "text-[74px] font-medium" },
};

// Fixed physics timestep (seconds) — keeps the spring identical on 60Hz, 120Hz and 144Hz displays
const PHYSICS_STEP = 1 / 240;
// How tightly the shape follows the pointer while dragging (higher = snappier, lower = silkier)
const FOLLOW_SHARPNESS = 38;
// Release velocity cap (px/s) so violent flicks stay elegant
const MAX_RELEASE_SPEED = 2600;
const PRESS_DEPTH = 5;
// Physical "key" feel: the body sinks into a darker edge and springs back with a little pop
const KEY_STIFFNESS = 1100;
const KEY_DAMPING = 34;
const HOVER_LIFT = 2;

function isInsideCapsule(px: number, py: number, width: number, height: number): boolean {
  const r = height / 2;
  const halfS = Math.max(0, width - 2 * r) / 2;
  const sx = Math.max(-halfS, Math.min(halfS, px));
  return Math.hypot(px - sx, py) <= r;
}

export const StretchyButton = React.forwardRef<HTMLButtonElement, StretchyButtonProps>(
  (
    {
      children = "Stretch me",
      variant = "default",
      size = "default",
      stiffness = 320,
      damping = 13,
      mass = 1.2,
      maxStretch = 650,
      fullInterface = true,
      fillColor,
      strokeColor,
      strokeWidth,
      customWidth,
      customHeight,
      onStretch,
      onRelease,
      onClick,
      disabled = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const id = useId().replace(/:/g, "_");
    const containerRef = useRef<HTMLDivElement>(null);
    const internalButtonRef = useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => internalButtonRef.current!);

    const baseConfigWidth = customWidth ?? sizeDimensions[size].width;
    const baseConfigHeight = customHeight ?? sizeDimensions[size].height;
    const baseConfigFont = sizeDimensions[size].fontSize;

    // Responsive scaling: adjusts dynamically based on both viewport width & height
    const computeDimensions = useCallback(() => {
      if (typeof window === "undefined") {
        return { width: baseConfigWidth, height: baseConfigHeight, fontSize: baseConfigFont };
      }
      const maxW = Math.min(baseConfigWidth, window.innerWidth * 0.88);
      const maxH = window.innerHeight * 0.38;
      const scale = Math.min(maxW / baseConfigWidth, maxH / baseConfigHeight, 1);
      return {
        width: Math.round(baseConfigWidth * scale),
        height: Math.round(baseConfigHeight * scale),
        fontSize: Math.round(baseConfigFont * scale),
      };
    }, [baseConfigWidth, baseConfigHeight, baseConfigFont]);

    const [dimensions, setDimensions] = useState(computeDimensions);

    useEffect(() => {
      const updateDimensions = () => setDimensions(computeDimensions());
      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      window.addEventListener("orientationchange", updateDimensions);
      return () => {
        window.removeEventListener("resize", updateDimensions);
        window.removeEventListener("orientationchange", updateDimensions);
      };
    }, [computeDimensions]);

    const baseWidth = dimensions.width;
    const baseHeight = dimensions.height;
    const fontSize = dimensions.fontSize;

    const isStringContent = typeof children === "string";

    // Base geometry points
    const basePerimeter = React.useMemo(
      () => getCapsulePoints(baseWidth, baseHeight, 48),
      [baseWidth, baseHeight]
    );

    const baseCenterline = React.useMemo(
      () => getCenterlinePoints(baseWidth, baseHeight, 24),
      [baseWidth, baseHeight]
    );

    // DOM nodes mutated directly each frame (bypasses React reconciliation for buttery 120fps)
    const bodyPathRef = useRef<SVGPathElement>(null);
    const glossPathRef = useRef<SVGPathElement>(null);
    const centerlineRef = useRef<SVGPathElement>(null);
    const textRef = useRef<SVGTextElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const edgePathRef = useRef<SVGPathElement>(null);
    const bodyGroupRef = useRef<SVGGElement>(null);

    // Physics & Interaction refs
    const grabPointRef = useRef<Point>({ x: 0, y: 0 });
    const deltaRef = useRef<Point>({ x: 0, y: 0 });
    const targetRef = useRef<Point>({ x: 0, y: 0 });
    const velocityRef = useRef<Point>({ x: 0, y: 0 });
    const pressDepthRef = useRef<number>(0);
    const accumulatorRef = useRef<number>(0);
    const isDraggingRef = useRef<boolean>(false);
    const isPressingRef = useRef<boolean>(false);
    const dragStartRef = useRef<Point>({ x: 0, y: 0 });
    const animFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const hasDraggedBeyondThreshold = useRef<boolean>(false);
    // Cached client-space center of the resting capsule, and the latest tip position
    const centerRef = useRef<Point>({ x: 0, y: 0 });
    const tipRef = useRef<Point>({ x: 0, y: 0 });
    // Key press spring (0 = resting, 1 = fully pressed into the edge) and hover lift
    const keyRef = useRef<number>(0);
    const keyVelRef = useRef<number>(0);
    const keyHeldRef = useRef<boolean>(false);
    const pressedOnButtonRef = useRef<boolean>(false);
    const hoverRef = useRef<number>(0);
    const hoverTargetRef = useRef<number>(0);

    const edgeDepth = Math.max(4, Math.round(baseHeight * 0.055));

    // Latest callbacks, read from the animation loop without re-creating it
    const onStretchRef = useRef(onStretch);
    const onReleaseRef = useRef(onRelease);
    useEffect(() => {
      onStretchRef.current = onStretch;
      onReleaseRef.current = onRelease;
    }, [onStretch, onRelease]);

    const centerlinePathId = `stretchy-cline-${id}`;
    const gradientId = `stretchy-grad-${id}`;
    const glossId = `stretchy-gloss-${id}`;

    // Write the deformed geometry straight to the DOM
    const updateVisuals = useCallback(
      (delta: Point, grab: Point, pressDepth = 0) => {
        const cx = baseWidth / 2;
        const cy = baseHeight / 2;

        const defPerim = basePerimeter.map((p) => {
          const d = deformPoint(p, grab, delta, baseWidth, baseHeight, pressDepth);
          return { x: d.x + cx, y: d.y + cy };
        });
        const defCenter = baseCenterline.map((p) => {
          const d = deformPoint(p, grab, delta, baseWidth, baseHeight, pressDepth);
          return { x: d.x + cx, y: d.y + cy };
        });

        const perimeterD = catmullRomToBezier(defPerim);
        edgePathRef.current?.setAttribute("d", perimeterD);
        bodyPathRef.current?.setAttribute("d", perimeterD);
        glossPathRef.current?.setAttribute("d", perimeterD);
        centerlineRef.current?.setAttribute("d", openSplineToBezier(defCenter));

        const dist = Math.hypot(delta.x, delta.y);
        const key = keyRef.current;
        const hover = hoverRef.current;

        // Body (with gloss + label) rides on top of the edge: lifts on hover, sinks on press
        const bodyY = -hover * HOVER_LIFT * (1 - Math.min(1, Math.max(0, key))) + key * (edgeDepth - 1.5);
        bodyGroupRef.current?.setAttribute("transform", `translate(0 ${bodyY.toFixed(2)})`);

        // Letters drift apart as the material stretches
        if (textRef.current) {
          const spread = Math.min(fontSize * 0.4, Math.abs(delta.x) * 0.022);
          textRef.current.setAttribute("letter-spacing", spread.toFixed(2));
        }

        // For non-string children
        if (contentRef.current) {
          const textX = delta.x * 0.35;
          const textY = delta.y * 0.6;
          const slope = (delta.y / baseHeight) * (grab.x / (baseWidth / 2)) * 12;
          contentRef.current.style.transform = `translate3d(${textX.toFixed(2)}px, ${textY.toFixed(2)}px, 0px) rotate(${slope.toFixed(2)}deg)`;
        }

        // Soft glow follows the body's center of mass and stretches with it
        if (glowRef.current) {
          const sx = 1 + (Math.abs(delta.x) / baseWidth) * 0.9;
          const sy = 1 + (Math.abs(delta.y) / baseHeight) * 0.3;
          // Pressing flattens the shadow, hovering lifts it
          const lift = 1 - key * 0.35 + hover * 0.08;
          glowRef.current.style.transform = `translate3d(${(delta.x * 0.5).toFixed(2)}px, ${(delta.y * 0.55 + baseHeight * 0.22 * lift).toFixed(2)}px, 0) scale(${(sx * (1 - key * 0.06)).toFixed(3)}, ${(sy * lift).toFixed(3)})`;
          glowRef.current.style.opacity = Math.max(0.15, 0.5 + Math.min(0.3, dist / 700) - key * 0.2 + hover * 0.08).toFixed(3);
        }

        const tipLocal = deformPoint(grab, grab, delta, baseWidth, baseHeight, pressDepth);
        tipRef.current = { x: centerRef.current.x + tipLocal.x, y: centerRef.current.y + tipLocal.y };

        if (onStretchRef.current) {
          const angle = Math.atan2(delta.y, delta.x) * (180 / Math.PI);
          onStretchRef.current({ dx: delta.x, dy: delta.y, distance: dist, angle, tip: tipRef.current });
        }
      },
      [basePerimeter, baseCenterline, baseWidth, baseHeight, fontSize, edgeDepth]
    );

    const measureCenter = useCallback(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, []);

    // Paint the current shape before the browser paints (mount + resize)
    React.useLayoutEffect(() => {
      measureCenter();
      updateVisuals(deltaRef.current, grabPointRef.current, pressDepthRef.current);
    }, [updateVisuals, measureCenter]);

    // Single animation loop: smooth pointer follow while dragging, fixed-step spring after release
    const physicsLoop = useCallback(
      (now: number) => {
        // rAF timestamps can precede performance.now() on the first frame, so clamp to [0, 50ms]
        const frameDt = Math.max(0, Math.min((now - lastTimeRef.current) / 1000, 0.05));
        lastTimeRef.current = now;

        const d = deltaRef.current;
        const v = velocityRef.current;

        const pressingButton = isPressingRef.current && pressedOnButtonRef.current;

        // Ease press indentation in/out instead of snapping
        const pressTarget = pressingButton ? PRESS_DEPTH : 0;
        const pressK = 1 - Math.exp(-frameDt * 30);
        pressDepthRef.current += (pressTarget - pressDepthRef.current) * pressK;

        // Key travel spring (underdamped → satisfying pop on release)
        const keyTarget = pressingButton || keyHeldRef.current ? 1 : 0;
        const keySteps = Math.max(1, Math.ceil(frameDt / PHYSICS_STEP));
        const h = frameDt / keySteps;
        for (let i = 0; i < keySteps; i++) {
          keyVelRef.current += (-KEY_STIFFNESS * (keyRef.current - keyTarget) - KEY_DAMPING * keyVelRef.current) * h;
          keyRef.current = Math.min(1.06, keyRef.current + keyVelRef.current * h);
        }
        const keyMoving = Math.abs(keyRef.current - keyTarget) > 0.003 || Math.abs(keyVelRef.current) > 0.02;

        const hoverDiff = hoverTargetRef.current - hoverRef.current;
        hoverRef.current += hoverDiff * (1 - Math.exp(-frameDt * 14));
        const hoverMoving = Math.abs(hoverDiff) > 0.003;

        if (isDraggingRef.current) {
          const t = targetRef.current;
          const k = 1 - Math.exp(-frameDt * FOLLOW_SHARPNESS);
          const nx = d.x + (t.x - d.x) * k;
          const ny = d.y + (t.y - d.y) * k;

          // Track velocity so the release carries the flick's momentum
          if (frameDt > 0) {
            v.x = v.x * 0.55 + ((nx - d.x) / frameDt) * 0.45;
            v.y = v.y * 0.55 + ((ny - d.y) / frameDt) * 0.45;
          }

          const moved = Math.abs(nx - d.x) + Math.abs(ny - d.y);
          d.x = nx;
          d.y = ny;

          if (moved > 0.01 || keyMoving || hoverMoving || Math.abs(pressTarget - pressDepthRef.current) > 0.01) {
            updateVisuals(d, grabPointRef.current, pressDepthRef.current);
          }
        } else {
          accumulatorRef.current += frameDt;
          while (accumulatorRef.current >= PHYSICS_STEP) {
            // Semi-implicit Euler: stable and energy-friendly
            const ax = (-stiffness * d.x - damping * v.x) / mass;
            const ay = (-stiffness * d.y - damping * v.y) / mass;
            v.x += ax * PHYSICS_STEP;
            v.y += ay * PHYSICS_STEP;
            d.x += v.x * PHYSICS_STEP;
            d.y += v.y * PHYSICS_STEP;
            accumulatorRef.current -= PHYSICS_STEP;
          }

          updateVisuals(d, grabPointRef.current, pressDepthRef.current);

          const speed = Math.hypot(v.x, v.y);
          const dist = Math.hypot(d.x, d.y);

          if (speed < 0.25 && dist < 0.15 && pressDepthRef.current < 0.05 && !keyMoving && !hoverMoving) {
            deltaRef.current = { x: 0, y: 0 };
            velocityRef.current = { x: 0, y: 0 };
            pressDepthRef.current = 0;
            keyRef.current = keyTarget;
            keyVelRef.current = 0;
            hoverRef.current = hoverTargetRef.current;
            accumulatorRef.current = 0;
            updateVisuals({ x: 0, y: 0 }, { x: 0, y: 0 });
            animFrameRef.current = null;
            return;
          }
        }

        animFrameRef.current = requestAnimationFrame(physicsLoop);
      },
      [stiffness, damping, mass, updateVisuals]
    );

    const ensureLoop = useCallback(() => {
      if (!animFrameRef.current) {
        lastTimeRef.current = performance.now();
        accumulatorRef.current = 0;
        animFrameRef.current = requestAnimationFrame(physicsLoop);
      }
    }, [physicsLoop]);

    const startDragAt = useCallback(
      (clientX: number, clientY: number) => {
        if (disabled) return;
        const container = containerRef.current;
        if (!container) return;

        isDraggingRef.current = true;
        isPressingRef.current = true;
        hasDraggedBeyondThreshold.current = false;
        if (fullInterface) document.documentElement.classList.add("is-stretching");

        measureCenter();
        const centerX = centerRef.current.x;
        const centerY = centerRef.current.y;

        pressedOnButtonRef.current = isInsideCapsule(clientX - centerX, clientY - centerY, baseWidth, baseHeight);

        // Exact mathematical closest surface point on capsule from anywhere on screen
        const closest = getClosestCapsulePoint(clientX - centerX, clientY - centerY, baseWidth, baseHeight);

        grabPointRef.current = { x: closest.x, y: closest.y };
        dragStartRef.current = { x: clientX, y: clientY };
        targetRef.current = { x: 0, y: 0 };
        velocityRef.current = { x: 0, y: 0 };

        ensureLoop();
      },
      [baseWidth, baseHeight, disabled, fullInterface, ensureLoop, measureCenter]
    );

    const moveDragAt = useCallback(
      (clientX: number, clientY: number) => {
        if (!isDraggingRef.current || disabled) return;

        const rawDx = clientX - dragStartRef.current.x;
        const rawDy = clientY - dragStartRef.current.y;
        const dist = Math.hypot(rawDx, rawDy);

        if (dist > 4) {
          hasDraggedBeyondThreshold.current = true;
          isPressingRef.current = false;
        }

        // Rubber-band resistance: stretches freely at first, then stiffens
        if (dist > 0) {
          const factor = (maxStretch * Math.tanh(dist / maxStretch)) / dist;
          targetRef.current = { x: rawDx * factor, y: rawDy * factor };
        } else {
          targetRef.current = { x: 0, y: 0 };
        }
      },
      [disabled, maxStretch]
    );

    const endDragAt = useCallback(() => {
      if (!isDraggingRef.current || disabled) return;

      isDraggingRef.current = false;
      isPressingRef.current = false;
      document.documentElement.classList.remove("is-stretching");

      // Quick tactile click rebound pop if not dragged
      if (!hasDraggedBeyondThreshold.current) {
        deltaRef.current = {
          x: (grabPointRef.current.x / (baseWidth / 2)) * 4,
          y: (grabPointRef.current.y / (baseHeight / 2)) * 4,
        };
        velocityRef.current = {
          x: -deltaRef.current.x * 28,
          y: -deltaRef.current.y * 28,
        };

        if (onClick) internalButtonRef.current?.click();
        ensureLoop();
        return;
      }

      // Cap the flick momentum
      const v = velocityRef.current;
      const speed = Math.hypot(v.x, v.y);
      if (speed > MAX_RELEASE_SPEED) {
        v.x *= MAX_RELEASE_SPEED / speed;
        v.y *= MAX_RELEASE_SPEED / speed;
      }

      const stretchDist = Math.hypot(deltaRef.current.x, deltaRef.current.y);

      // Light haptic snap on supported devices
      if (stretchDist > 40 && typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(Math.min(24, 6 + stretchDist / 30));
        } catch {
          // Haptics unavailable
        }
      }

      onReleaseRef.current?.({
        dx: deltaRef.current.x,
        dy: deltaRef.current.y,
        velocity: { ...velocityRef.current },
        tip: { ...tipRef.current },
      });

      ensureLoop();
    }, [baseHeight, baseWidth, disabled, onClick, ensureLoop]);

    // Handle full-interface pointer capture across the entire window
    useEffect(() => {
      if (!fullInterface) return;

      const onWindowPointerDown = (e: PointerEvent) => {
        // Only trigger on primary button
        if (e.button !== 0) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest("button:not(.stretchy-button-hidden), [data-interactive='true'], a, input, select, textarea")) {
          return;
        }
        startDragAt(e.clientX, e.clientY);
      };

      const onWindowPointerMove = (e: PointerEvent) => {
        moveDragAt(e.clientX, e.clientY);
      };

      const onWindowPointerUp = () => {
        endDragAt();
      };

      window.addEventListener("pointerdown", onWindowPointerDown);
      window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
      window.addEventListener("pointerup", onWindowPointerUp);
      window.addEventListener("pointercancel", onWindowPointerUp);
      window.addEventListener("blur", onWindowPointerUp);

      return () => {
        window.removeEventListener("pointerdown", onWindowPointerDown);
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerUp);
        window.removeEventListener("blur", onWindowPointerUp);
      };
    }, [fullInterface, startDragAt, moveDragAt, endDragAt]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (fullInterface) return; // Handled by global window listener
      e.currentTarget.setPointerCapture(e.pointerId);
      startDragAt(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (fullInterface) return;
      moveDragAt(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      if (fullInterface) return;
      endDragAt();
    };

    // Keyboard behaves like a real key: goes down on keydown, clicks on keyup
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled || isDraggingRef.current) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (e.repeat || keyHeldRef.current) return;
        keyHeldRef.current = true;
        ensureLoop();
      }
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
      if (!keyHeldRef.current) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        keyHeldRef.current = false;
        if (onClick) internalButtonRef.current?.click();
        ensureLoop();
      }
    };

    const setHover = (on: boolean) => {
      if (disabled) return;
      hoverTargetRef.current = on ? 1 : 0;
      ensureLoop();
    };

    useEffect(() => {
      return () => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
        document.documentElement.classList.remove("is-stretching");
      };
    }, []);

    const variantConfig = variantStyles[variant];
    const fill = fillColor ?? variantConfig.fill;
    const stroke = strokeColor ?? variantConfig.stroke ?? "none";
    const strokeW = strokeWidth ?? (variantConfig.stroke ? 1.5 : 0);
    const glowColor = variantConfig.gradient
      ? variantConfig.gradientColors?.[0] ?? "#3F9CFF"
      : fill;

    return (
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={() => {
          keyHeldRef.current = false;
          ensureLoop();
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-disabled={disabled}
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          ...style,
        }}
        className={cn(
          "relative inline-flex items-center justify-center select-none touch-none outline-none max-w-[92vw]",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-slate-400 rounded-full",
          className
        )}
      >
        <button
          ref={internalButtonRef}
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={onClick}
          className="sr-only stretchy-button-hidden"
          {...props}
        />

        {/* Soft colored glow that stretches with the body */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="absolute inset-x-[8%] inset-y-[10%] rounded-full pointer-events-none"
          style={{
            backgroundColor: glowColor,
            filter: `blur(${Math.round(baseHeight * 0.28)}px)`,
            opacity: 0.5,
            willChange: "transform, opacity",
            transition: "background-color 500ms ease",
          }}
        />

        {/* Dynamic morphing SVG — 1:1 viewBox, overflow visible so the stretch can reach across the whole interface */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-visible w-full h-full"
          viewBox={`0 0 ${baseWidth} ${baseHeight}`}
        >
          <defs>
            {variantConfig.gradient && (
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={variantConfig.gradientColors?.[0] ?? "#3F9CFF"} />
                <stop offset="100%" stopColor={variantConfig.gradientColors?.[1] ?? "#8B5CF6"} />
              </linearGradient>
            )}
            {/* Jelly gloss: top sheen + soft bottom shade that follow the deforming shape */}
            <linearGradient id={glossId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
              <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0.04" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
            </linearGradient>
          </defs>

          {/* Key edge: darker base the body sits on and sinks into */}
          <path
            ref={edgePathRef}
            transform={`translate(0 ${edgeDepth})`}
            style={{
              fill: `color-mix(in oklab, ${variantConfig.gradient ? variantConfig.gradientColors?.[1] ?? "#8B5CF6" : fill} 68%, #000)`,
              transition: "fill 500ms ease",
            }}
          />

          <g ref={bodyGroupRef}>
            {/* Morphing Capsule Body */}
            <path
              ref={bodyPathRef}
              stroke={stroke}
              strokeWidth={strokeW}
              style={{
                fill: variantConfig.gradient ? `url(#${gradientId})` : fill,
                transition: "fill 500ms ease",
              }}
            />

            {/* Gloss overlay */}
            <path ref={glossPathRef} fill={`url(#${glossId})`} />

            {/* Dynamic Centerline Path (Invisible, guides the text) */}
            <path ref={centerlineRef} id={centerlinePathId} fill="none" stroke="none" />

            {/* Authentic Curved SVG Text along centerline if string content */}
            {isStringContent && (
              <text
                ref={textRef}
                fill="#FFFFFF"
                fontSize={fontSize}
                fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif"
                fontWeight="500"
                dominantBaseline="central"
                className="select-none pointer-events-none"
                style={{ textShadow: "0 1px 1px rgba(0,0,0,0.12)" }}
              >
                <textPath
                  href={`#${centerlinePathId}`}
                  startOffset="50%"
                  textAnchor="middle"
                >
                  {children}
                </textPath>
              </text>
            )}
          </g>
        </svg>

        {/* Fallback for complex JSX / React Element children */}
        {!isStringContent && (
          <div
            ref={contentRef}
            style={{ willChange: "transform" }}
            className={cn(
              "relative z-10 flex items-center justify-center pointer-events-none select-none px-8",
              sizeDimensions[size].textClass,
              variantConfig.text
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

StretchyButton.displayName = "StretchyButton";
export default StretchyButton;
