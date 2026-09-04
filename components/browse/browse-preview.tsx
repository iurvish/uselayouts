"use client";

import * as React from "react";
import { Index } from "@/registry/__index__";
import { cn } from "@/lib/utils";

export function BrowsePreview({
  name,
  background,
  paused = false,
}: {
  name: string;
  background?: string;
  paused?: boolean;
}) {
  const Component = Index[name]?.component as React.ComponentType<{ size?: string }> | undefined;

  return (
    <div
      className="browse-preview"
      aria-hidden
      inert={true}
      data-paused={paused || undefined}
      style={background ? { background } : undefined}
    >
      {Component ? (
        <React.Suspense fallback={null}>
          <div className={cn("browse-preview-stage")}>
            <Component size="sm" />
          </div>
        </React.Suspense>
      ) : null}
    </div>
  );
}
