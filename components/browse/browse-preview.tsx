"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { LayoutGroup } from "motion/react";

import { Index } from "@/registry/__index__";
import { cn } from "@/lib/utils";

class PreviewBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <span className="text-xs text-white/30">Preview unavailable</span>;
    }
    return this.props.children;
  }
}

export function BrowsePreview({
  name,
  still = false,
}: {
  name: string;
  still?: boolean;
}) {
  const id = React.useId();
  const Component = Index[name]?.component as React.ComponentType<{ size?: string }> | undefined;

  return (
    <div className={cn("browse-preview", still && "browse-preview--still")} aria-hidden>
      <LayoutGroup id={id}>
        <PreviewBoundary>
          <React.Suspense
            fallback={
              <div className="flex size-full items-center justify-center">
                <Loader2 className="size-4 animate-spin text-white/25" />
              </div>
            }
          >
            {Component ? (
              <Component size="sm" />
            ) : (
              <span className="text-xs text-white/30">No preview</span>
            )}
          </React.Suspense>
        </PreviewBoundary>
      </LayoutGroup>
    </div>
  );
}
