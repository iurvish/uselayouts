"use client";

import * as React from "react";

import { Index } from "@/registry/__index__";
import { cn } from "@/lib/utils";

export function OpenPreview({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Component = Index[name]?.component as React.ComponentType<{ size?: string }> | undefined;

  return (
    <div
      className={cn(
        // no min-h-full: that overrides grid min-height:auto and clips tall sticky demos
        "component-showcase dark grid w-full min-w-0 text-foreground",
        className,
      )}
    >
      {Component ? (
        <div className="flex w-full min-w-0 items-[safe_center] justify-center">
          <Component size="lg" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">This component has no live preview yet.</p>
      )}
    </div>
  );
}
