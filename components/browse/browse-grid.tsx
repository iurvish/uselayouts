"use client";

import type { BrowseItem } from "@/lib/browse/items";
import { BrowseCard } from "./glass-card";
import { mediaHeight } from "@/lib/browse/media";

export function BrowseGrid({ items }: { items: BrowseItem[] }) {
  return (
    <div className="pb-24">
      <div className="browse-masonry">
        {items.map((item, index) => (
          <BrowseCard
            key={item.slug}
            item={item}
            index={index}
            eager={index < 6}
            surface="pin"
            pinHeight={mediaHeight(index)}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted-foreground">
          Nothing matches that search yet.
        </p>
      ) : null}
    </div>
  );
}
