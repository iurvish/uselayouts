"use client";

/* eslint-disable @next/next/no-img-element -- posters are remote CDN stills. */

import * as React from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";

import { browseUploadedMedia } from "@/lib/browse/items";
import { browseMediaUrl } from "@/lib/browse/media-url";

/**
 * A component tile for the category and index grids.
 *
 * The poster is a plain <img> in the server HTML, so the grid is crawlable and
 * the page has something cheap to paint. The video is only created on hover and
 * carries preload="none" — a category page holds up to 19 tiles, and preloading
 * those is roughly 6MB for motion nobody asked to see yet.
 */
export function ComponentPreviewCard({
  slug,
  title,
  href,
  description,
  isNew,
}: {
  slug: string;
  title: string;
  href: string;
  description: string;
  isNew?: boolean;
}) {
  const reduce = useReducedMotion();
  const { poster, video } = browseUploadedMedia(slug);
  const [active, setActive] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const posterSrc = poster ? browseMediaUrl(poster) : "";
  const videoSrc = video ? browseMediaUrl(video) : "";
  const canPlay = Boolean(videoSrc) && !reduce;

  function start() {
    if (canPlay) setActive(true);
  }

  function stop() {
    setActive(false);
    setReady(false);
  }

  return (
    <li>
      <Link
        href={href}
        className="group block focus-visible:outline-none"
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
      >
        {posterSrc ? (
          <div
            // A fixed ratio reserves the box before the poster lands, so the
            // grid cannot reflow as images arrive.
            className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-[#E8E5DF] shadow-[inset_0_0_0_1px_rgba(7,26,49,0.08)] transition-shadow group-hover:shadow-[inset_0_0_0_1px_rgba(7,26,49,0.18)] group-focus-visible:shadow-[inset_0_0_0_2px_#071A31]"
          >
            <img
              src={posterSrc}
              alt={`${title} — animated React component preview`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            {active && canPlay ? (
              <video
                src={videoSrc}
                poster={posterSrc}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
                onLoadedData={(event) => {
                  setReady(true);
                  void event.currentTarget.play();
                }}
                className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ${
                  ready ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : null}
          </div>
        ) : null}

        <h3 className="text-[17px] leading-snug font-medium tracking-[-0.01em]">
          <span className="underline decoration-[#071A31]/20 decoration-1 underline-offset-[3px] transition-colors group-hover:decoration-[#071A31]/60">
            {title} React component
          </span>
          {isNew ? (
            <span className="ml-2 align-middle font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide uppercase text-[#4B565E]">
              new
            </span>
          ) : null}
        </h3>
        {description ? (
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#4B565E]">
            {description}
          </p>
        ) : null}
      </Link>
    </li>
  );
}
