"use client";

import { useEffect, useRef } from "react";

const DEFAULT_TEXT =
  "Design systems are not just a folder of components. They are a shared rhythm: spacing that breathes, type that reads at every scale, and motion that feels intentional rather than decorative. When those choices compound, every screen feels like it belongs to the same thoughtful product.";

export function PerspectiveText() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    currentProgress: 0,
    targetProgress: 0,
    rafId: 0,
    frameCount: 0,
    fps: 120,
    fpsTimer: performance.now(),
  });

  const lerpFactor = 0.1;
  const backgroundColor = "#F7F4F2";
  const textColor = "#7B9E87";

  const interpolateKeyframes = (
    p: number,
    keyframes: {
      p: number;
      rotX: number;
      transY: number;
      transZ: number;
      opacity: number;
    }[],
  ) => {
    const clampedP = Math.max(0, Math.min(1, p));

    for (let i = 0; i < keyframes.length - 1; i++) {
      const k1 = keyframes[i];
      const k2 = keyframes[i + 1];

      if (clampedP >= k1.p && clampedP <= k2.p) {
        const segmentProgress = (clampedP - k1.p) / (k2.p - k1.p);
        return {
          rotX: k1.rotX + (k2.rotX - k1.rotX) * segmentProgress,
          transY: k1.transY + (k2.transY - k1.transY) * segmentProgress,
          transZ: k1.transZ + (k2.transZ - k1.transZ) * segmentProgress,
          opacity: k1.opacity + (k2.opacity - k1.opacity) * segmentProgress,
        };
      }
    }

    const last = keyframes[keyframes.length - 1];
    return {
      rotX: last.rotX,
      transY: last.transY,
      transZ: last.transZ,
      opacity: last.opacity,
    };
  };

  const KEYFRAMES = [
    { p: 0.0, rotX: 42, transY: 520, transZ: -30, opacity: 0.0 },
    { p: 0.12, rotX: 38, transY: 220, transZ: -10, opacity: 1.0 },
    { p: 0.5, rotX: 0, transY: 0, transZ: 25, opacity: 1.0 },
    { p: 0.85, rotX: -24, transY: -180, transZ: 45, opacity: 1.0 },
    { p: 1.0, rotX: -36, transY: -320, transZ: 60, opacity: 0.0 },
  ];

  const applyTransform = (p: number) => {
    if (!textRef.current) return;

    const values = interpolateKeyframes(p, KEYFRAMES);

    textRef.current.style.transform = `rotateX(${values.rotX.toFixed(4)}deg) translate3d(0px, ${values.transY.toFixed(4)}px, ${values.transZ.toFixed(4)}px)`;
    textRef.current.style.opacity = values.opacity.toFixed(4);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateTargetProgress = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollDistance = rect.height - windowHeight;

      if (totalScrollDistance <= 0) return 0;

      const currentScroll = -rect.top;
      const progress = currentScroll / totalScrollDistance;
      return Math.max(0, Math.min(1, progress));
    };

    const handleScroll = () => {
      stateRef.current.targetProgress = calculateTargetProgress();
    };

    const renderLoop = (time: number) => {
      const state = stateRef.current;

      state.frameCount++;
      if (time - state.fpsTimer >= 500) {
        state.fps = Math.round(
          (state.frameCount * 1000) / (time - state.fpsTimer),
        );
        state.frameCount = 0;
        state.fpsTimer = time;
      }

      const diff = state.targetProgress - state.currentProgress;

      if (Math.abs(diff) > 0.00002) {
        state.currentProgress += diff * lerpFactor;
        applyTransform(state.currentProgress);
      }

      state.rafId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    stateRef.current.targetProgress = calculateTargetProgress();
    stateRef.current.currentProgress = stateRef.current.targetProgress;
    applyTransform(stateRef.current.currentProgress);

    stateRef.current.rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(stateRef.current.rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Perspective text scroll visualization"
      className="relative w-full bg-[#F7F4F2] text-[#7B9E87]"
      style={{ height: "300vh" }}
    >
      <div
        className="sticky top-0 left-0 flex h-screen w-full items-center justify-center overflow-hidden perspective-[200px]"
        style={{ perspectiveOrigin: "50% 50%" }}
      >
        <div
          ref={textRef}
          className="relative w-full max-w-3xl px-6 text-center text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            color: textColor,
            willChange: "transform, opacity",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            transform: "rotateX(42deg) translate3d(0px, 520px, -30px)",
            opacity: 0,
          }}
        >
          {DEFAULT_TEXT}

          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[40%] w-full select-none"
            style={{
              background: `linear-gradient(to bottom, transparent, ${backgroundColor})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PerspectiveText;
