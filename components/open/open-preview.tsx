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
        // min-h-full (not h-full): tall demos must expand so the docs <main> can scroll
        "component-showcase dark grid min-h-full w-full min-w-0 text-foreground",
        className,
      )}
    >
      {Component ? (
        <div className="flex min-h-full w-full min-w-0 items-center justify-center">
          <Component size="lg" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">This component has no live preview yet.</p>
      )}
    </div>
  );
}
