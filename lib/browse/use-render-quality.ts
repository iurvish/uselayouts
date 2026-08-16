"use client";

import * as React from "react";

export type RenderQuality = "high" | "low";

type DeviceMemoryNavigator = Navigator & { deviceMemory?: number };

function detect(): RenderQuality {
  if (typeof window === "undefined") return "high";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";

  const nav = navigator as DeviceMemoryNavigator;
  if ((nav.hardwareConcurrency ?? 8) <= 4) return "low";
  if ((nav.deviceMemory ?? 8) <= 4) return "low";
  if (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900) {
    return "low";
  }
  return "high";
}

/**
 * Drops the most expensive glass layers (extra refraction pass, chromatic rim,
 * wide blurs) on constrained devices. Starts optimistic so SSR output is stable.
 */
export function useRenderQuality(): RenderQuality {
  const [quality, setQuality] = React.useState<RenderQuality>("high");

  React.useEffect(() => {
    setQuality(detect());

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setQuality(detect());
    motion.addEventListener("change", onChange);
    return () => motion.removeEventListener("change", onChange);
  }, []);

  return quality;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}
