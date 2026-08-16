"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BrowseItem } from "@/lib/browse/items";
import { cn } from "@/lib/utils";
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
        <div className="browse-card browse-pin-media" style={{ height: pinHeight }}>
          <CardShell item={item} still={still} hit={false} />
        </div>
        <div className="browse-pin-caption">
          <h3 className="text-sm font-medium tracking-[-0.01em] text-white">{item.title}</h3>
          <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-white/40">
            {item.category}
          </span>
        </div>
        <Link
          href={`/docs/components/${item.slug}`}
          className="browse-card-hit"
          aria-label={item.title}
          draggable={false}
        />
      </article>
    );
  }

  return (
    <div className={cn("browse-card size-full", className)} style={style}>
      <CardShell item={item} still={still}>
        <div className="browse-scrim" />
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-4">
          <div className="flex items-end justify-between gap-2">
            <h3 className="truncate text-sm font-medium leading-snug tracking-[-0.01em] text-white">
              {item.title}
            </h3>
            <span className="browse-enter flex size-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
              <ArrowUpRight className="size-3" strokeWidth={2} />
            </span>
          </div>
        </div>
      </CardShell>
    </div>
  );
}
