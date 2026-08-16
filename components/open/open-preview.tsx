"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Index } from "@/registry/__index__";

export function OpenPreview({ name }: { name: string }) {
  const Component = Index[name]?.component as React.ComponentType<{ size?: string }> | undefined;

  return (
    <div className="open-preview">
      <React.Suspense
        fallback={
          <div className="flex size-full items-center justify-center text-white/40">
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
    </div>
  );
}
