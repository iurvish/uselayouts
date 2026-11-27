import * as React from "react";

import { cn } from "@/lib/utils";

/** Figma 117:3894 — numbered steps with #47474d connectors */
export function DocsSteps({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <ol className="relative my-0 grid list-none gap-0 p-0">
      {items.map((child, index) => (
        <li
          key={index}
          className={cn(
            "relative grid grid-cols-[24px_minmax(0,1fr)] gap-3",
            index !== items.length - 1 && "pb-4",
            index !== items.length - 1 &&
              "before:absolute before:top-6 before:bottom-0 before:left-3 before:w-px before:-translate-x-1/2 before:bg-[hsl(240_4%_29%)] before:content-['']",
          )}
        >
          {/* Figma 120:43 — 24px, radius 8, fill #323239, outer ring + inset highlight */}
          <span
            className={cn(
              "relative z-1 grid size-6 place-items-center overflow-hidden rounded-md border border-[hsl(240_4%_29%)] bg-[hsl(240_5%_21%)] text-[15px] tracking-[-0.45px] text-[hsl(240_4%_58%)]",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",
              "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
              "after:shadow-[inset_0_1px_0.5px_0_hsla(0,0%,100%,0.08)]",
            )}
            aria-hidden
          >
            <span className="relative">{index + 1}</span>
          </span>
          <div className="min-w-0">{child}</div>
        </li>
      ))}
    </ol>
  );
}
