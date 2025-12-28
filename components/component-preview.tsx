"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Index } from "@/registry/__index__";
import { Loader2 } from "lucide-react";

interface ComponentPreviewProps extends React.ComponentProps<"div"> {
  name?: string;
  align?: "center" | "start" | "end";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  full?: boolean;
}

export function ComponentPreview({
  name,
  children,
  className,
  align = "center",
  size = "md",
  full = false,
  ...props
}: ComponentPreviewProps) {
  const Component = React.useMemo(() => {
    if (!name) return null;
    return Index[name]?.component;
  }, [name]);

  return (
    <div
      className={cn(
        "relative flex flex-col w-full rounded-xl border border-fd-border",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative flex w-full overflow-hidden light bg-[#F0F0F0] text-foreground rounded-xl",
          !full ? "p-4 md:p-10 min-h-[400px]" : "p-0 min-h-[300px]",
          align === "center" && "items-center justify-center",
          align === "start" && "items-start justify-center",
          align === "end" && "items-end justify-center"
        )}
      >
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center w-full h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          {Component ? (
            <Component size={size} />
          ) : (
            React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { size } as any);
              }
              return child;
            })
          )}
        </React.Suspense>
      </div>
    </div>
  );
}
