"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BrowseItem } from "@/lib/browse/items";
import { cn } from "@/lib/utils";
import { NewDot } from "@/components/ui/new-dot";
import { BrowsePreview } from "./browse-preview";

export type MediaMode = "video" | "image";

type BrowseCardProps = {
  item: BrowseItem;
  index: number;
  mediaMode: MediaMode;
  eager?: boolean;
  className?: string;
  style?: React.CSSProperties;
  surface?: "canvas" | "pin";
  pinHeight?: number;
};

function CardShell({
  item,
  still,
  hit = true,
  children,
}: {
  item: BrowseItem;
  still: boolean;
  hit?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <BrowsePreview name={item.slug} still={still} />
      {hit ? (
        <Link
          href={`/docs/components/${item.slug}`}
          className="browse-card-hit"
          aria-label={item.title}
          draggable={false}
        />
      ) : null}
      {children}
    </>
  );
}

export function BrowseCard({
  item,
  mediaMode,
  className,
  style,
  surface = "canvas",
  pinHeight = 320,
}: BrowseCardProps) {
  const still = mediaMode === "image";

  if (surface === "pin") {
    return (
      <article className={cn("browse-pin", className)} style={style}>
        <Link
          href={`/docs/components/${item.slug}`}
          aria-label={item.isNew ? `${item.title}, new` : item.title}
          draggable={false}
          className="block rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
        >
          <div className="browse-chrome">
            <div className="browse-chrome-title">
              <h3 className="inline-flex min-w-0 items-center gap-1.5 text-base font-normal tracking-[-0.48px] text-foreground">
                <span className="truncate">{item.title}</span>
                {item.isNew ? <NewDot /> : null}
              </h3>
            </div>
            <div className="browse-chrome-media">
              <div className="browse-card browse-pin-media" style={{ height: pinHeight }}>
                <CardShell item={item} still={still} hit={false} />
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <div className={cn("browse-card size-full", className)} style={style}>
      <CardShell item={item} still={still}>
        <div className="browse-scrim" />
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-4">
          <div className="flex items-end justify-between gap-2">
            <h3 className="inline-flex min-w-0 items-center gap-1.5 truncate text-base font-normal tracking-[-0.48px] text-foreground">
              <span className="truncate">{item.title}</span>
              {item.isNew ? <NewDot /> : null}
            </h3>
            <span className="browse-enter flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground">
              <ArrowUpRight className="size-3" strokeWidth={2} />
            </span>
          </div>
        </div>
      </CardShell>
    </div>
  );
}
