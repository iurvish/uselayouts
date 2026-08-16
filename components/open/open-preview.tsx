"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { HintOverlayFrame } from "@/components/open/hint-overlay-frame";
import { InteractionHintLayer } from "@/components/open/interaction-hints";
import type { InteractionHintConfig } from "@/lib/open/hints";
import { Index } from "@/registry/__index__";

export function OpenPreview({
  name,
  className,
  hints,
}: {
  name: string;
  className?: string;
  hints?: { config: InteractionHintConfig; playing: boolean };
}) {
  const Component = Index[name]?.component as React.ComponentType<{ size?: string }> | undefined;

  return (
    <HintOverlayFrame
      className={className}
      overlay={
        hints?.playing ? (
          <InteractionHintLayer config={hints.config} playing />
        ) : null
      }
    >
      <React.Suspense
        fallback={
          <div
            data-hint-ignore=""
            className="flex size-24 items-center justify-center text-white/40"
          >
            <Loader2 className="size-5 animate-spin" />
          </div>
        }
      >
        {Component ? (
          <Component size="lg" />
        ) : (
          <p className="text-sm text-white/40">This component has no live preview yet.</p>
        )}
      </React.Suspense>
    </HintOverlayFrame>
  );
}
