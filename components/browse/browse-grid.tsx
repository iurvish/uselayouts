"use client";

import * as React from "react";

import type { BrowseItem } from "@/lib/browse/items";
import { packPinMasonry, PIN_GAP, pinColumnCount } from "@/lib/browse/masonry";
import { posterMediaHeight, tileHeightFor } from "@/lib/browse/media";
import { usePosterAspects } from "@/lib/browse/use-poster-aspects";
import { BrowseCard } from "./glass-card";

const BATCH = 12;
const PIN_MEDIA_X = 8;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export function BrowseGrid({ items, paused = false }: { items: BrowseItem[]; paused?: boolean }) {
  const [visibleCount, setVisibleCount] = React.useState(() => Math.min(BATCH, items.length));
  const [width, setWidth] = React.useState(0);
  const masonryRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setVisibleCount(Math.min(BATCH, items.length));
  }, [items]);

  useIsomorphicLayoutEffect(() => {
    const node = masonryRef.current;
    if (!node) return;

    const apply = () => {
      const next = Math.round(node.clientWidth);
      setWidth((current) => (current === next ? current : next));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

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
  const { aspects, setAspect } = usePosterAspects(shown);
  const columns = pinColumnCount(width);
  const columnWidth = width > 0 ? (width - PIN_GAP * (columns - 1)) / columns : 0;
  const mediaWidth = Math.max(0, columnWidth - PIN_MEDIA_X);
  const packed = packPinMasonry(
    shown.length,
    columns,
    columnWidth,
    PIN_GAP,
    shown.map((item, index) =>
      tileHeightFor(mediaWidth, aspects[item.slug], index),
    ),
  );

  return (
    <div className="pb-24">
      <div
        ref={masonryRef}
        className="browse-masonry"
        style={width > 0 ? { height: packed.height } : undefined}
      >
        {width > 0
          ? shown.map((item, index) => {
              const slot = packed.slots[index];
              if (!slot) return null;
              return (
                <BrowseCard
                  key={item.slug}
                  item={item}
                  index={index}
                  eager={index < 6}
                  surface="pin"
                  paused={paused}
                  observeVisibility
                  pinHeight={posterMediaHeight(
                    mediaWidth,
                    aspects[item.slug],
                    index,
                  )}
                  onMediaAspect={(ratio) => setAspect(item.slug, ratio)}
                  style={{
                    position: "absolute",
                    top: slot.y,
                    left: slot.x,
                    width: slot.width,
                  }}
                />
              );
            })
          : null}
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
