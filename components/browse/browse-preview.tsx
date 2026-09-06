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
}: {
  poster: string;
  video?: string;
  eager?: boolean;
  paused?: boolean;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node || !video) {
      setPlaying(false);
      return;
    }

    if (paused) {
      releasePlayback(node);
      node.pause();
      setPlaying(false);
      return;
    }

    requestPlayback(node, PRIORITY_VISIBLE);
    return () => releasePlayback(node);
  }, [video, paused]);

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    node.addEventListener("play", onPlay);
    node.addEventListener("pause", onPause);
    node.addEventListener("ended", onEnded);
    setPlaying(!node.paused);

    return () => {
      node.removeEventListener("play", onPlay);
      node.removeEventListener("pause", onPause);
      node.removeEventListener("ended", onEnded);
    };
  }, [video]);

  const showVideo = Boolean(video) && !paused && playing;

  return (
    <div className="browse-preview" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote poster frames, sized by the card. */}
      <img
        src={poster}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />
      {video ? (
        <video
          ref={videoRef}
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          preload={eager ? "metadata" : "none"}
          draggable={false}
          className={cn(!showVideo && "opacity-0")}
        />
      ) : null}
    </div>
  );
}
