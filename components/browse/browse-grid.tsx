"use client";

import * as React from "react";

import type { BrowseItem } from "@/lib/browse/items";
import { mediaHeight } from "@/lib/browse/media";
import { BrowseCard } from "./glass-card";

const BATCH = 12;

export function BrowseGrid({ items, paused = false }: { items: BrowseItem[]; paused?: boolean }) {
  const [visibleCount, setVisibleCount] = React.useState(() => Math.min(BATCH, items.length));
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setVisibleCount(Math.min(BATCH, items.length));
  }, [items]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= items.length) return;

    const root = sentinel.closest("[data-view]") as Element | null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisibleCount((count) => Math.min(count + BATCH, items.length));
      },
      { root, rootMargin: "600px 0px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [items.length, visibleCount]);

  const shown = items.slice(0, visibleCount);

  return (
    <div className="pb-24">
      <div className="browse-masonry">
        {shown.map((item, index) => (
          <BrowseCard
            key={item.slug}
            item={item}
            index={index}
            eager={index < 6}
            surface="pin"
            pinHeight={mediaHeight(index)}
            paused={paused}
            observeVisibility
          />
        ))}
      </div>

      {visibleCount < items.length ? (
        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      ) : null}

      {items.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted-foreground">
          Nothing matches that search yet.
        </p>
      ) : null}
    </div>
  );
}
