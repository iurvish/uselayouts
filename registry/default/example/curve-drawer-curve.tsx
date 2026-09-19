"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

const CURVE_EASE = [0.76, 0, 0.24, 1] as const;

type CurveProps = {
  side?: "left" | "right";
  className?: string;
  curveWidth?: number;
  open?: boolean;
};

export default function Curve({
  side = "left",
  className,
  curveWidth = 100,
  open = true,
}: CurveProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const svgRef = useRef<SVGSVGElement>(null);
  const [animHeight, setAnimHeight] = useState(0);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const parent = svgRef.current?.parentElement;
      const measured = parent
        ? parent.offsetHeight || window.innerHeight
        : window.innerHeight;
      if (!animHeight) {
        setAnimHeight(measured);
      }
    };

    updateHeight();

    const parent = svgRef.current?.parentElement;
    const ro = new ResizeObserver(updateHeight);
    if (parent) {
      ro.observe(parent);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [animHeight]);

  const isLeft = side === "left";
  const w = curveWidth;
  const h = animHeight;
  const edgeX = isLeft ? 0 : w;
  const controlX = isLeft ? w * 2 : -w;
  const bulged = `M${edgeX} 0 L${edgeX} ${h} Q${controlX} ${h / 2} ${edgeX} 0`;
  const straight = `M${edgeX} 0 L${edgeX} ${h} Q${edgeX} ${h / 2} ${edgeX} 0`;
  const pathInitial = open ? bulged : straight;
  const pathAnimate = open ? straight : [straight, straight, bulged, straight];
  const pathTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : open
      ? {
          type: "tween" as const,
          duration: 1,
          ease: CURVE_EASE,
        }
      : {
          type: "tween" as const,
          duration: 0.8,
          ease: CURVE_EASE,
          times: [0, 0.36, 0.52, 1],
        };

  const offset = `-${w - 1}px`;
  const positionStyle: CSSProperties = isLeft
    ? { right: offset }
    : { left: offset };

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-0 z-10 h-full overflow-visible fill-popover",
        className
      )}
      focusable="false"
      preserveAspectRatio="none"
      ref={svgRef}
      stroke="none"
      style={{ width: w, ...positionStyle }}
    >
      {h > 0 ? (
        <motion.path
          animate={{ d: pathAnimate }}
          d={straight}
          initial={{ d: pathInitial }}
          key={`${open ? "open" : "closed"}-${h}`}
          transition={pathTransition}
        />
      ) : null}
    </svg>
  );
}
