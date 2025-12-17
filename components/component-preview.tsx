"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PlusSignIcon,
  MinusSignIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ComponentPreviewProps extends React.ComponentProps<"div"> {
  align?: "center" | "start" | "end";
}

export function ComponentPreview({
  children,
  className,
  align = "center",
  ...props
}: ComponentPreviewProps) {
  const [zoom, setZoom] = React.useState(1);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <div
      className={cn(
        "relative flex flex-col w-full rounded-xl border border-fd-border",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-end gap-2 border-b border-fd-border p-2 bg-fd-muted/30">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            title="Zoom Out"
          >
            <HugeiconsIcon icon={MinusSignIcon} className="size-4" />
            <span className="sr-only">Zoom Out</span>
          </Button>
          <span className="text-xs font-medium w-12 text-center tabular-nums text-fd-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={zoomIn}
            disabled={zoom >= 2}
            title="Zoom In"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
            <span className="sr-only">Zoom In</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={resetZoom}
            disabled={zoom === 1}
            title="Reset Zoom"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-4" />
            <span className="sr-only">Reset Zoom</span>
          </Button>
        </div>
      </div>
      <div className="relative flex min-h-[400px] w-full items-center justify-center overflow-hidden p-10 light bg-background text-foreground rounded-b-xl">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
          }}
          className="transition-transform duration-200 ease-in-out"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
