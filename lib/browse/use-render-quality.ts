"use client";

import * as React from "react";

import { isConstrainedDevice } from "@/lib/browse/video-pool";

export type RenderQuality = "high" | "low";

function detect(): RenderQuality {
  if (typeof window === "undefined") return "low";
  return isConstrainedDevice(navigator, window) ? "low" : "high";
}

/**
 * Drops the most expensive glass layers (extra refraction pass, chromatic rim,
 * wide blurs) on constrained devices. Starts low so phones never mount a
 * desktop-sized video ring on the first paint.
 */
export function useRenderQuality(): RenderQuality {
  const [quality, setQuality] = React.useState<RenderQuality>("low");

  React.useEffect(() => {
    setQuality(detect());

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const onChange = () => setQuality(detect());
    motion.addEventListener("change", onChange);
    coarse.addEventListener("change", onChange);
    return () => {
      motion.removeEventListener("change", onChange);
      coarse.removeEventListener("change", onChange);
    };
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
