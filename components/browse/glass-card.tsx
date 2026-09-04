"use client";

import * as React from "react";
import Link from "next/link";

import type { BrowseItem } from "@/lib/browse/items";
import { cn } from "@/lib/utils";
import { NewDot } from "@/components/ui/new-dot";
import { BrowsePreview } from "./browse-preview";

type BrowseCardProps = {
  item: BrowseItem;
  index: number;
  eager?: boolean;
  className?: string;
  style?: React.CSSProperties;
  surface?: "canvas" | "pin";
  pinHeight?: number;
  paused?: boolean;
};

export function BrowseCard({
  item,
  className,
  style,
  surface = "canvas",
  pinHeight = 320,
  paused = false,
}: BrowseCardProps) {
  const label = item.isNew ? `${item.title}, new` : item.title;

  if (surface === "pin") {
    return (
      <article className={cn("browse-pin", className)} style={style}>
        <div className="browse-chrome">
          <div className="browse-chrome-title">
            <h3 className="inline-flex min-w-0 items-center gap-1.5 text-base font-normal tracking-[-0.48px] text-foreground">
              <span className="truncate">{item.title}</span>
              {item.isNew ? <NewDot /> : null}
            </h3>
          </div>
          <div className="browse-chrome-media">
            <div className="browse-card browse-pin-media" style={{ height: pinHeight }}>
              <BrowsePreview name={item.slug} background={item.background} paused={paused} />
            </div>
          </div>
        </div>
        <Link
          href={`/docs/components/${item.slug}`}
          aria-label={label}
          draggable={false}
          className="browse-card-hit rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
        />
      </article>
    );
  }

  return (
    <div className={cn("browse-card size-full", className)} style={style}>
      <BrowsePreview name={item.slug} background={item.background} paused={paused} />
      <Link
        href={`/docs/components/${item.slug}`}
        aria-label={label}
        draggable={false}
        className="browse-card-hit rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
      />
    </div>
  );
}
