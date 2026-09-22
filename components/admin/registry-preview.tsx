"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Index } from "@/registry/__index__";
import { cn } from "@/lib/utils";

export function AdminRegistryPreview({
  name,
  padding = 24,
}: {
  name: string;
  padding?: number;
}) {
  const Component = Index[name]?.component as React.ComponentType | undefined;

  return (
    <div
      className={cn(
        "component-showcase relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-lg border border-border bg-background text-foreground",
      )}
      style={{ padding }}
    >
      <React.Suspense fallback={<Loader2 className="size-5 animate-spin text-muted-foreground" />}>
        {Component ? <Component /> : <p className="text-sm text-muted-foreground">No registry preview.</p>}
      </React.Suspense>
    </div>
  );
}
