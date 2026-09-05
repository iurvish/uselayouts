"use client";

/* eslint-disable @next/next/no-img-element -- browse posters are remote stills. */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { browseItems } from "@/lib/browse/items";
import { Index } from "@/registry/__index__";
import { cn } from "@/lib/utils";

const PREVIEW_W = 177;
const PREVIEW_H = 117;

export type SidebarHoverTarget = {
  slug: string;
  title: string;
  /** Top offset relative to the peek panel root. */
  top: number;
};

function LiveMiniPreview({ slug }: { slug: string }) {
  const Component = Index[slug]?.component as
    | React.ComponentType<{ size?: string }>
    | undefined;
  if (!Component) return null;
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-background">
      <div className="pointer-events-none origin-center scale-[0.38]">
        <React.Suspense fallback={null}>
          <Component size="sm" />
        </React.Suspense>
      </div>
    </div>
  );
}

function PosterPreview({ slug, title }: { slug: string; title: string }) {
  const poster = browseItems.find((item) => item.slug === slug)?.poster;
  if (!poster) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-muted px-3 text-center text-[11px] text-muted-foreground">
        {title}
      </div>
    );
  }
  return (
    <img
      src={poster}
      alt=""
      className="absolute inset-0 size-full object-cover"
      draggable={false}
    />
  );
}

export function SidebarHoverPreview({
  target,
  className,
}: {
  target: SidebarHoverTarget | null;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const hasLive = Boolean(target && Index[target.slug]?.component);

  return (
    <AnimatePresence>
      {target ? (
        <motion.div
          key={target.slug}
          role="presentation"
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-30 overflow-hidden rounded-[10px] border border-border bg-card shadow-lg",
            className,
          )}
          style={{
            width: PREVIEW_W,
            height: PREVIEW_H,
            left: 248 + 8,
            top: target.top,
          }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateX(-4px) scale(0.98)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateX(0px) scale(1)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateX(-4px) scale(0.98)" }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        >
          {hasLive ? (
            <LiveMiniPreview slug={target.slug} />
          ) : (
            <PosterPreview slug={target.slug} title={target.title} />
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
