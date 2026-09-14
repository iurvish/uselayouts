"use client";

import * as React from "react";

import { PreviewHint } from "@/components/open/preview-hint";
import { Index } from "@/registry/__index__";
import type { ResolvedPreviewHint } from "@/lib/open/preview-hint-config";
import { cn } from "@/lib/utils";

export function OpenPreview({
  name,
  className,
  hintTop,
  hint,
  hintTone = "dark",
}: {
  name: string;
  className?: string;
  hintTop?: number;
  hint?: ResolvedPreviewHint | null;
  hintTone?: "dark" | "light";
}) {
  const Component = Index[name]?.component as React.ComponentType<{ size?: string }> | undefined;
  // Tall sticky demos that scroll <main> must size to content, not the viewport.
  const fill = name !== "perspective-text-scroll";
  // This demo is its own scrollport (`overflow-y-auto`). min-h-0 stops the
  // 5×110vh track from inflating this grid item so <main> never becomes the scroller.
  const nestedPageScroll = name === "scroll-stack-deck";

  const inner = Component ? (
    <div
      className={cn(
        // items-center (not safe_center): Tailwind never emitted items-[safe_center],
        // so align-items stayed normal/stretch and short demos pinned to the top.
        "flex w-full min-w-0 items-center justify-center",
        fill && "h-full",
        nestedPageScroll && "min-h-0",
      )}
    >
      <Component size="lg" />
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">This component has no live preview yet.</p>
  );

  return (
    <div
      className={cn(
        // no min-h-full: that overrides grid min-height:auto and clips tall sticky demos
        "component-showcase dark grid w-full min-w-0 text-foreground",
        fill ? "h-full" : "h-max",
        nestedPageScroll && "min-h-0",
        className,
      )}
      style={
        hintTop != null
          ? ({ "--preview-hint-top": `${hintTop}px` } as React.CSSProperties)
          : undefined
      }
    >
      {Component && hint ? (
        <PreviewHint
          heading={hint.heading}
          description={hint.description}
          tone={hintTone}
          absolute={fill}
          className={fill ? "h-full" : "h-auto"}
        >
          {inner}
        </PreviewHint>
      ) : (
        inner
      )}
    </div>
  );
}
