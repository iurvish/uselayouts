"use client";

import * as React from "react";

import type { BrowseItem } from "@/lib/browse/items";

export function usePosterAspects(items: BrowseItem[]) {
  const [aspects, setAspects] = React.useState<Record<string, number>>({});
  const key = items.map((item) => `${item.slug}:${item.poster}`).join("|");

  const setAspect = React.useCallback((slug: string, ratio: number) => {
    if (!Number.isFinite(ratio) || ratio <= 0) return;
    setAspects((current) =>
      current[slug] === ratio ? current : { ...current, [slug]: ratio },
    );
  }, []);

  React.useEffect(() => {
    let live = true;
    let raf = 0;
    const pending: Record<string, number> = {};

    const flush = () => {
      raf = 0;
      if (!live) return;
      setAspects((current) => {
        let changed = false;
        const merged = { ...current };
        for (const [slug, ratio] of Object.entries(pending)) {
          if (merged[slug] !== ratio) {
            merged[slug] = ratio;
            changed = true;
          }
        }
        return changed ? merged : current;
      });
    };

    for (const item of items) {
      if (!item.poster) continue;
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          pending[item.slug] = img.naturalWidth / img.naturalHeight;
          if (!raf) raf = requestAnimationFrame(flush);
        }
      };
      img.src = item.poster;
    }

    return () => {
      live = false;
      cancelAnimationFrame(raf);
    };
  }, [key]);

  return { aspects, setAspect };
}
