"use client";

/* eslint-disable @next/next/no-img-element -- browse posters are remote stills. */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { browseUploadedMedia } from "@/lib/browse/items";
import { cn } from "@/lib/utils";

const PREVIEW_W = 177;
const PREVIEW_H = 117;

export type SidebarHoverTarget = {
  slug: string;
  title: string;
  /** Top offset relative to the peek panel root. */
  top: number;
};

function MediaMiniPreview({ slug, title }: { slug: string; title: string }) {
  const reduce = useReducedMotion();
  const { poster, video } = browseUploadedMedia(slug);
  const [videoReady, setVideoReady] = React.useState(false);
  const playVideo = Boolean(video) && !reduce;

  React.useEffect(() => {
    setVideoReady(false);
  }, [video]);

  if (!poster && !video) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-muted px-3 text-center text-[11px] text-muted-foreground">
        {title}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-muted">
      {poster ? (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 size-full object-cover"
          draggable={false}
          decoding="async"
          fetchPriority="high"
        />
      ) : null}
      {playVideo ? (
        <video
          key={video}
          src={video}
          poster={poster || undefined}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          draggable={false}
          onLoadedData={(event) => {
            setVideoReady(true);
            void event.currentTarget.play();
          }}
          onCanPlay={(event) => {
            setVideoReady(true);
            void event.currentTarget.play();
          }}
          className={cn(
            "absolute inset-0 size-full object-cover",
            videoReady ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </div>
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

  return (
    <AnimatePresence>
      {target ? (
        <motion.div
          key={target.slug}
          role="presentation"
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-30 overflow-hidden rounded-[10px] border border-[hsl(240_4%_29%)] bg-[hsl(0_0%_85%)] shadow-lg",
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
          <MediaMiniPreview slug={target.slug} title={target.title} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
