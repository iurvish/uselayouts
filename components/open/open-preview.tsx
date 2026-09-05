"use client";

import * as React from "react";

import { Index } from "@/registry/__index__";
import { cn } from "@/lib/utils";

/** Figma 82:3892 — titled preview card chrome */
export function OpenPreview({
  name,
  title,
  className,
}: {
  name: string;
  title?: string;
  className?: string;
}) {
  const Component = Index[name]?.component as React.ComponentType<{ size?: string }> | undefined;
  const label = title?.trim() || name;

  return (
    <div
      className={cn(
        "flex w-full max-w-[min(100%,720px)] flex-col overflow-hidden rounded-[10px] bg-[hsl(240_5%_21%)] px-1 pb-[5px] shadow-[0_0_0_1px_rgba(255,255,255,0.1)]",
        className,
      )}
    >
      <div className="flex shrink-0 items-center rounded-t-[12px] bg-[hsl(240_5%_21%)] p-2.5">
        <p className="text-base leading-normal font-normal whitespace-nowrap text-white">{label}</p>
      </div>
      <div className="relative min-h-[min(50vh,480px)] w-full overflow-hidden rounded-lg border border-white/14 bg-[hsl(0_0%_96%)]">
        <div className="grid h-full min-h-[min(50vh,480px)] w-full place-items-center p-6">
          {Component ? (
            <Component size="lg" />
          ) : (
            <p className="text-sm text-muted-foreground">This component has no live preview yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
