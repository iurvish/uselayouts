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
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [mediaMode] = React.useState<MediaMode>("video");
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
        "dark flex min-h-dvh flex-col bg-background font-[family-name:var(--font-geist-sans)] text-foreground",
        isCanvas && "h-dvh overflow-hidden",
      )}
    >
      <BrowseHeader query={query} onQueryChange={setQuery} />

      <div
        className={cn(
          "flex min-h-0 flex-1 px-3 pt-0.5 pb-2.5",
          isCanvas && "overflow-hidden",
        )}
      >
        <div
          className={cn(
            "relative min-h-0 w-full flex-1 overflow-hidden rounded-2xl bg-muted p-[18px]",
            !isCanvas && "overflow-auto",
          )}
        >
          {isEmpty ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="text-sm text-muted-foreground">No components match “{query}”.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Clear search
              </button>
            </div>
          ) : isCanvas ? (
            <InfiniteCanvas items={filtered} mediaMode={mediaMode} />
          ) : (
            <BrowseGrid items={filtered} mediaMode={mediaMode} />
          )}
        </div>
      </div>

      {isCanvas && !isEmpty ? (
        <p className="browse-hint pointer-events-none absolute bottom-8 left-8 z-20 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Drag to explore
        </p>
      ) : null}

      <BrowseToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
    </div>
  );
}
