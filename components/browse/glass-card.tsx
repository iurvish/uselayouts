"use client";

/* eslint-disable @next/next/no-img-element -- tiles need direct control over
   decode + lazy loading so the video pool can decide what plays. */

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BrowseItem } from "@/lib/browse/items";
import { PRIORITY_HOVER, releasePlayback, requestPlayback } from "@/lib/browse/video-pool";
import { usePrefersReducedMotion } from "@/lib/browse/use-render-quality";
import { cn } from "@/lib/utils";

export type MediaMode = "video" | "image";

type BrowseCardProps = {
  item: BrowseItem;
  index: number;
  mediaMode: MediaMode;
  /** Eager-load the still poster only — videos still wait for the viewport. */
  eager?: boolean;
  className?: string;
  style?: React.CSSProperties;
  surface?: "canvas" | "pin";
  pinHeight?: number;
};

const VISIBILITY_STEPS = [0, 0.15, 0.4, 0.7, 1];

export function BrowseCard({
  item,
  mediaMode,
  eager = false,
  className,
  style,
  surface = "canvas",
  pinHeight = 320,
}: BrowseCardProps) {
  const rootRef = React.useRef<HTMLAnchorElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [near, setNear] = React.useState(false);
  const [visibility, setVisibility] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [videoReady, setVideoReady] = React.useState(false);
  const [videoMounted, setVideoMounted] = React.useState(false);

  const wantsVideo = !reducedMotion && near && (mediaMode === "video" ? visibility > 0 : hovered);

  React.useEffect(() => {
    if (wantsVideo) {
      setVideoMounted(true);
      return;
    }

    const timer = window.setTimeout(() => setVideoMounted(false), 600);
    return () => window.clearTimeout(timer);
  }, [wantsVideo]);

  React.useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const approaching = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "35% 35% 35% 35%",
      threshold: 0,
    });
    const visible = new IntersectionObserver(([entry]) => setVisibility(entry.intersectionRatio), {
      threshold: VISIBILITY_STEPS,
    });

    approaching.observe(node);
    visible.observe(node);
    return () => {
      approaching.disconnect();
      visible.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (wantsVideo) {
      requestPlayback(video, hovered ? PRIORITY_HOVER : Math.max(visibility, 0.01));
    } else {
      releasePlayback(video);
    }
  }, [wantsVideo, hovered, visibility]);

  React.useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) releasePlayback(video);
    };
  }, [videoMounted]);

  React.useEffect(() => {
    if (!videoMounted) setVideoReady(false);
  }, [videoMounted]);

  const showVideo = videoMounted && videoReady && wantsVideo;
  const loading = eager ? "eager" : "lazy";

  const media = (
    <>
      <img
        className="browse-media"
        src={item.poster}
        alt=""
        loading={loading}
        decoding="async"
        fetchPriority={eager ? "high" : "low"}
        draggable={false}
      />
      {videoMounted ? (
        <video
          ref={videoRef}
          className="browse-media browse-video"
          data-active={showVideo}
          src={item.video}
          poster={item.poster}
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setVideoReady(true)}
          aria-hidden
        />
      ) : null}
    </>
  );

  if (surface === "pin") {
    return (
      <Link
        ref={rootRef}
        href={`/docs/components/${item.slug}`}
        className={cn("browse-pin", className)}
        style={style}
        aria-label={item.title}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        draggable={false}
      >
        <div className="browse-card browse-pin-media" style={{ height: pinHeight }}>
          {media}
        </div>
        <div className="browse-pin-caption">
          <h3 className="text-sm font-medium tracking-[-0.01em] text-white">{item.title}</h3>
          <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-white/40">
            {item.category}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      ref={rootRef}
      href={`/docs/components/${item.slug}`}
      className={cn("block size-full", className)}
      style={style}
      aria-label={item.title}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      draggable={false}
    >
      <div className="browse-card size-full">
        {media}
        <div className="browse-scrim" />
        <div className="relative z-10 flex h-full flex-col justify-end p-4">
          <div className="flex items-end justify-between gap-2">
            <h3 className="truncate text-sm font-medium leading-snug tracking-[-0.01em] text-white">
              {item.title}
            </h3>
            <span className="browse-enter flex size-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
              <ArrowUpRight className="size-3" strokeWidth={2} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
