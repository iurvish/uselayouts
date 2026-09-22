"use client";

import * as React from "react";
import type { BrowseItem } from "@/lib/browse/items";
import { rankSearchItems } from "@/lib/component-tags";
import { useRenderQuality } from "@/lib/browse/use-render-quality";
import { BrowseGrid } from "./browse-grid";
import { BrowseHeader } from "./browse-header";
import { BrowseToolbar, type ViewMode } from "./browse-toolbar";
import { InfiniteCanvas } from "./infinite-canvas";
import { cn } from "@/lib/utils";

export function BrowseExperience({ items }: { items: BrowseItem[] }) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("canvas");
  const [query, setQuery] = React.useState("");
  const [paused, setPaused] = React.useState(false);
  const quality = useRenderQuality();

  const filtered = React.useMemo(() => {
    return rankSearchItems(items, query, (item) => ({
      name: `${item.title} ${item.slug}`,
      tags: item.tags,
      extra: `${item.description} ${item.category}`,
    }));
  }, [items, query]);

  const isEmpty = filtered.length === 0;
  const isCanvas = viewMode === "canvas";

  return (
    <div
      data-quality={quality}
      className="dark flex h-dvh cursor-auto flex-col overflow-hidden bg-background font-[family-name:var(--font-geist-sans)] text-foreground"
    >
      <BrowseHeader query={query} onQueryChange={setQuery} />

      <div className="flex min-h-0 flex-1 overflow-hidden px-3 pt-0.5 pb-2.5">
        <div
          data-view={isCanvas ? "canvas" : "grid"}
          className={cn(
            "relative min-h-0 w-full flex-1 rounded-2xl bg-muted p-4 sm:p-[18px]",
            isCanvas ? "overflow-hidden" : "overflow-auto",
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
            <InfiniteCanvas items={filtered} paused={paused} />
          ) : (
            <BrowseGrid items={filtered} paused={paused} />
          )}
        </div>
      </div>

      <BrowseToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        paused={paused}
        onPausedChange={setPaused}
      />
    </div>
  );
}
