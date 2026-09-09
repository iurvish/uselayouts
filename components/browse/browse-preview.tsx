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
  video,
  eager = false,
  paused = false,
  /** When false, poster only — no <video> in the DOM (saves bandwidth + decode). */
  allowVideo = true,
  /** Grid/list: gate playback with IntersectionObserver. Canvas passes allowVideo geometrically. */
  observeVisibility = false,
  /** Canvas: distance-weighted priority so center tiles win the playback pool. */
  playbackPriority = PRIORITY_VISIBLE,
}: {
  poster: string;
  video?: string;
  eager?: boolean;
  paused?: boolean;
  allowVideo?: boolean;
  observeVisibility?: boolean;
  playbackPriority?: number;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [inView, setInView] = React.useState(!observeVisibility);

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

  const mountVideo = Boolean(video) && allowVideo && inView;

  const attachVideo = React.useCallback(
    (node: HTMLVideoElement | null) => {
      const prev = videoRef.current;
      if (prev && prev !== node) releasePlayback(prev);
      videoRef.current = node;
      if (!node) {
        setPlaying(false);
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
      setPlaying(false);
      return;
    }

    requestPlayback(node, playbackPriority);
    return () => releasePlayback(node);
  }, [mountVideo, paused, playbackPriority]);

  React.useEffect(() => {
    if (!mountVideo) {
      setReady(false);
      setPlaying(false);
    }
  }, [mountVideo]);

  // Show the video layer once it has a frame — even if the pool hasn't started
  // playback yet — so in-view cards don't look stuck on the poster.
  const showVideo = mountVideo && !paused && (playing || ready);

  return (
    <div ref={rootRef} className="browse-preview" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote poster frames, sized by the card. */}
      <img
        src={poster}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        draggable={false}
      />
      {mountVideo ? (
        <video
          ref={attachVideo}
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          draggable={false}
          onLoadedData={(event) => {
            setReady(true);
            if (!paused) requestPlayback(event.currentTarget, playbackPriority);
          }}
          onPlaying={() => setPlaying(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className={cn(!showVideo && "opacity-0")}
        />
      ) : null}
    </div>
  );
}
