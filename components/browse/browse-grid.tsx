"use client";

import type { BrowseItem } from "@/lib/browse/items";
import { BrowseCard, type MediaMode } from "./glass-card";
import { mediaHeight } from "@/lib/browse/media";

export function BrowseGrid({
  items,
  mediaMode,
}: {
  items: BrowseItem[];
  mediaMode: MediaMode;
}) {
  return (
    <div className="pb-28">
      <div className="browse-catalog-meta">
        <p>Library</p>
        <span>{String(items.length).padStart(2, "0")}</span>
      </div>

      <div className="browse-masonry">
        {items.map((item, index) => (
          <BrowseCard
            key={item.slug}
            item={item}
            index={index}
            mediaMode={mediaMode}
            eager={index < 6}
            surface="pin"
            pinHeight={mediaHeight(index)}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="py-24 text-center text-sm text-white/40">
          Nothing matches that search yet.
        </p>
      ) : null}
    </div>
  );
}
