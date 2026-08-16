"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DialRoot } from "dialkit";

import { Index } from "@/registry/__index__";
import { DialPreviewProvider, useDialPreview } from "@/components/dial-preview-context";
import { cn } from "@/lib/utils";

export function AdminRegistryPreview({
  name,
  padding = 24,
}: {
  name: string;
  padding?: number;
}) {
  return (
    <DialPreviewProvider>
      <AdminRegistryPreviewInner name={name} padding={padding} />
    </DialPreviewProvider>
  );
}

function AdminRegistryPreviewInner({
  name,
  padding,
}: {
  name: string;
  padding: number;
}) {
  const { setActive } = useDialPreview();
  const Component = Index[name]?.component as React.ComponentType | undefined;

  React.useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive]);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-lg border bg-muted/30",
        )}
        style={{ padding }}
      >
        <React.Suspense
          fallback={
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          }
        >
          {Component ? <Component /> : <p className="text-sm text-muted-foreground">No registry preview.</p>}
        </React.Suspense>
      </div>
      <div className="dialkit-inline-host h-[380px] overflow-hidden rounded-lg border bg-[#212121]">
        <DialRoot mode="inline" productionEnabled defaultOpen theme="dark" />
      </div>
    </div>
  );
}
