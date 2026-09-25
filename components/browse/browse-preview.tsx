"use client";

import * as React from "react";

import {
  PRIORITY_VISIBLE,
  releasePlayback,
  requestPlayback,
} from "@/lib/browse/video-pool";
import { cn } from "@/lib/utils";

export function BrowsePreview({
  poster,
  fallbackPoster,
  video,
  eager = false,
  paused = false,
  /** When false, poster only — no <video> in the DOM (saves bandwidth + decode). */
  allowVideo = true,
  /** Grid/list: gate playback with IntersectionObserver. Canvas passes allowVideo geometrically. */
  observeVisibility = false,
  /** Canvas: distance-weighted priority so center tiles win the playback pool. */
  playbackPriority = PRIORITY_VISIBLE,
  onAspect,
}: {
  poster: string;
  /** Stable image to use if the primary remote poster cannot be fetched. */
  fallbackPoster?: string;
  video?: string;
  eager?: boolean;
  paused?: boolean;
  allowVideo?: boolean;
  observeVisibility?: boolean;
  playbackPriority?: number;
  onAspect?: (ratio: number) => void;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = React.useState(false);
  const [inView, setInView] = React.useState(!observeVisibility);
  const [activePoster, setActivePoster] = React.useState(poster);
  const [videoFailed, setVideoFailed] = React.useState(false);

  React.useEffect(() => {
    setActivePoster(poster);
    setVideoFailed(false);
  }, [poster, video]);

  React.useEffect(() => {
    if (!observeVisibility) {
      setInView(true);
      return;
    }

    const node = rootRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio > 0);
      },
      { rootMargin: "64px 0px", threshold: [0, 0.05, 0.2] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [observeVisibility]);

  const mountVideo = Boolean(video) && allowVideo && inView && !videoFailed;

  const attachVideo = React.useCallback(
    (node: HTMLVideoElement | null) => {
      const prev = videoRef.current;
      if (prev && prev !== node) releasePlayback(prev);
      videoRef.current = node;
      if (!node) {
        setReady(false);
        return;
      }
      setReady(node.readyState >= 2);
      if (!paused) requestPlayback(node, playbackPriority);
    },
    [paused, playbackPriority],
  );

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node || !mountVideo) return;

    if (paused) {
      releasePlayback(node);
      node.pause();
      return;
    }

    requestPlayback(node, playbackPriority);
    return () => releasePlayback(node);
  }, [mountVideo, paused, playbackPriority]);

  React.useEffect(() => {
    if (!mountVideo) setReady(false);
  }, [mountVideo]);

  // Show the video layer once it has a frame — even if the pool hasn't started
  // playback yet — so in-view cards don't look stuck on the poster.
  const showVideo = mountVideo && !paused && ready;

  return (
    <div ref={rootRef} className="browse-preview" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote poster frames, sized by the card. */}
      <img
        src={activePoster}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
          onLoad={(event) => {
            const img = event.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              onAspect?.(img.naturalWidth / img.naturalHeight);
            }
          }}
          onError={() => {
            // Avoid an error loop if a consumer supplies the same URL twice.
            if (fallbackPoster && activePoster !== fallbackPoster) {
              setActivePoster(fallbackPoster);
            }
          }}
          draggable={false}
        />
        {mountVideo ? (
          <video
            ref={attachVideo}
            src={video}
            poster={activePoster}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            draggable={false}
            onLoadedMetadata={(event) => {
              const node = event.currentTarget;
              if (node.videoWidth > 0 && node.videoHeight > 0) {
                onAspect?.(node.videoWidth / node.videoHeight);
              }
            }}
            onLoadedData={(event) => {
            setReady(true);
            if (!paused) requestPlayback(event.currentTarget, playbackPriority);
          }}
            onError={() => setVideoFailed(true)}
          className={cn(!showVideo && "opacity-0")}
        />
      ) : null}
    </div>
  );
}
