"use client";

import { cn } from "@/lib/utils";

export function BrowsePreview({
  src,
  eager = false,
}: {
  src: string;
  eager?: boolean;
}) {
  return (
    <div className="browse-preview" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote poster frames, sized by the card. */}
      <img
        src={src}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="size-full object-cover"
      />
    </div>
  );
}
