"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ComponentPreviewProps extends React.ComponentProps<"div"> {
  align?: "center" | "start" | "end";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  full?: boolean;
}

export function ComponentPreview({
  children,
  className,
  align = "center",
  size = "md",
  full = false,
  ...props
}: ComponentPreviewProps) {
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
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { size } as any);
          }
          return child;
        })}
      </div>
    </div>
  );
}
