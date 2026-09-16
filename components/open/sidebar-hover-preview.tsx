"use client";

/* eslint-disable @next/next/no-img-element -- browse posters are remote stills. */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { browseUploadedMedia } from "@/lib/browse/items";
import { cn } from "@/lib/utils";

export const PREVIEW_W = 220;
const EASE_OUT = [0.32, 0.72, 0, 1] as const;
const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

const aspectBySlug = new Map<string, number>();
let lastAspect = 1;

export type SidebarHoverTarget = {
  slug: string;
  title: string;
  /** Vertical center of the hovered row, relative to the peek panel. */
  rowMid: number;
  panelHeight: number;
};

function rememberAspect(slug: string, width: number, height: number) {
  if (width <= 0 || height <= 0) return;
  const aspect = width / height;
  aspectBySlug.set(slug, aspect);
  lastAspect = aspect;
  return aspect;
}

function aspectFor(slug: string) {
  return aspectBySlug.get(slug) ?? lastAspect;
}

function MediaMiniPreview({
  slug,
  title,
  onAspect,
}: {
  slug: string;
  title: string;
  onAspect: (aspect: number) => void;
}) {
  const reduce = useReducedMotion();
  const { poster, video } = browseUploadedMedia(slug);
  const [videoReady, setVideoReady] = React.useState(false);
  const playVideo = Boolean(video) && !reduce;

  React.useEffect(() => {
    setVideoReady(false);
  }, [video]);

  const report = React.useCallback(
    (width: number, height: number) => {
      const aspect = rememberAspect(slug, width, height);
      if (aspect) onAspect(aspect);
    },
    [slug, onAspect],
  );

  if (!poster && !video) {
    return (
      <div className="grid size-full place-items-center px-3 text-center text-[11px] text-muted-foreground">
        {title}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {poster ? (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 size-full object-cover"
          draggable={false}
          decoding="async"
          fetchPriority="high"
          onLoad={(event) =>
            report(
              event.currentTarget.naturalWidth,
              event.currentTarget.naturalHeight,
            )
          }
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
          onLoadedMetadata={(event) => {
            report(
              event.currentTarget.videoWidth,
              event.currentTarget.videoHeight,
            );
          }}
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

function PreviewFrame({
  target,
  className,
  instant,
}: {
  target: SidebarHoverTarget;
  className?: string;
  instant: boolean;
}) {
  const reduce = useReducedMotion();
  const [aspect, setAspect] = React.useState(() => aspectFor(target.slug));

  React.useEffect(() => {
    setAspect(aspectFor(target.slug));
  }, [target.slug]);

  const rawHeight = PREVIEW_W / aspect;
  const height =
    target.panelHeight > 0
      ? Math.min(rawHeight, target.panelHeight)
      : rawHeight;
  const half = height / 2;
  const top = Math.min(
    Math.max(half, target.rowMid),
    Math.max(half, target.panelHeight - half),
  );

  const skip = reduce || instant;

  return (
    <motion.div
      role="presentation"
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-30 overflow-hidden rounded-[10px] border border-[hsl(240_4%_29%)] bg-[hsl(240_6%_10%)] shadow-lg",
        className,
      )}
      style={{
        width: PREVIEW_W,
        left: 248 + 8,
        top,
        y: "-50%",
        transformOrigin: "left center",
        willChange: "transform",
      }}
      initial={
        skip ? false : { opacity: 0, x: -4, scale: 0.95, height }
      }
      animate={{ opacity: 1, x: 0, scale: 1, height }}
      exit={
        reduce
          ? { opacity: 0 }
          : {
              opacity: 0,
              x: -4,
              scale: 0.95,
              transition: { duration: 0.15, ease: EASE_OUT },
            }
      }
      transition={
        reduce
          ? { duration: 0 }
          : {
              opacity: { duration: skip ? 0 : 0.2, ease: EASE_OUT },
              x: { duration: skip ? 0 : 0.2, ease: EASE_OUT },
              scale: { duration: skip ? 0 : 0.2, ease: EASE_OUT },
              height: { duration: skip ? 0 : 0.22, ease: EASE_IN_OUT },
            }
      }
    >
      <MediaMiniPreview
        slug={target.slug}
        title={target.title}
        onAspect={setAspect}
      />
    </motion.div>
  );
}

export function SidebarHoverPreview({
  target,
  className,
}: {
  target: SidebarHoverTarget | null;
  className?: string;
}) {
  const wasOpen = React.useRef(false);
  const instant = wasOpen.current && target !== null;
  wasOpen.current = target !== null;

  return (
    <AnimatePresence>
      {target ? (
        <PreviewFrame
          key="sidebar-hover-preview"
          target={target}
          className={className}
          instant={instant}
        />
      ) : null}
    </AnimatePresence>
  );
}
