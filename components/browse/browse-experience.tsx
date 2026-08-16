"use client";

import * as React from "react";
import type { BrowseItem } from "@/lib/browse/items";
import { useRenderQuality } from "@/lib/browse/use-render-quality";
import { BrowseGrid } from "./browse-grid";
import { BrowseHeader } from "./browse-header";
import { BrowseToolbar, type ViewMode } from "./browse-toolbar";
import { InfiniteCanvas } from "./infinite-canvas";
import type { MediaMode } from "./glass-card";
import { cn } from "@/lib/utils";

export function BrowseExperience({ items }: { items: BrowseItem[] }) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("canvas");
  const [mediaMode, setMediaMode] = React.useState<MediaMode>("video");
  const [query, setQuery] = React.useState("");
  const quality = useRenderQuality();

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(needle),
    );
  }, [items, query]);

  const isEmpty = filtered.length === 0;
  const isCanvas = viewMode === "canvas";

  return (
    <div
      data-quality={quality}
      className={cn(
        "bg-[#141414] text-white",
        isCanvas ? "fixed inset-0 overflow-hidden" : "min-h-screen",
      )}
    >
      {isCanvas ? (
        <div className="pointer-events-none absolute inset-x-[22px] top-[22px] z-20">
          <div className="pointer-events-auto">
            <BrowseHeader
              query={query}
              onQueryChange={setQuery}
              variant="float"
              mediaMode={mediaMode}
              onMediaModeChange={setMediaMode}
            />
          </div>
        </div>
      ) : (
        <BrowseHeader
          query={query}
          onQueryChange={setQuery}
          variant="sticky"
          mediaMode={mediaMode}
          onMediaModeChange={setMediaMode}
        />
      )}

      {isEmpty ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-sm text-white/60">No components match “{query}”.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-xs text-white/40 underline underline-offset-4 hover:text-white/70"
          >
            Clear search
          </button>
        </div>
      ) : isCanvas ? (
        <InfiniteCanvas items={filtered} mediaMode={mediaMode} />
      ) : (
        <BrowseGrid items={filtered} mediaMode={mediaMode} />
      )}

      {isCanvas && !isEmpty ? (
        <p className="browse-hint pointer-events-none absolute bottom-8 left-8 z-20 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-white/30">
          Drag to explore
        </p>
      ) : null}

      <BrowseToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
    </div>
  );
}
