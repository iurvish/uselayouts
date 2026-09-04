"use client";

import * as React from "react";

import {
  PRIORITY_VISIBLE,
  releasePlayback,
  requestPlayback,
} from "@/lib/browse/video-pool";

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

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node || !video) return;

    if (paused) {
      releasePlayback(node);
      node.pause();
      return;
    }

    requestPlayback(node, PRIORITY_VISIBLE);
    return () => releasePlayback(node);
  }, [video, paused]);

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
        />
      ) : null}
    </div>
  );
}
