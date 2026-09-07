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
        "component-showcase dark grid min-h-80 w-full min-w-0 place-items-center text-foreground",
        className,
      )}
    >
      {Component ? (
        <div className="flex h-full min-h-[min(60vh,640px)] w-full min-w-0 items-center justify-center">
          <Component size="lg" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">This component has no live preview yet.</p>
      )}
    </div>
  );
}
