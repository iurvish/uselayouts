"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import { openPressMotion } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

/** Figma 91:4635 — primary code button; hover only bumps lightness ~2–4. */
export function OpenActions({
  panel,
  onChange,
}: {
  panel: OpenPanel;
  onChange: (panel: OpenPanel) => void;
}) {
  const active = panel === "code";

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        type="button"
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-xl border-0 p-2.5 text-white",
          "bg-[hsl(230_77%_55%)]",
          "shadow-[inset_0_1px_0_0.2px_hsla(0,0%,100%,0.16),0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.12)]",
          "outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
          "transition-[transform,background-color,box-shadow] duration-150",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
          "active:bg-[hsl(230_77%_55%)]",
          openPressMotion,
        )}
        aria-label="Code"
        aria-pressed={active}
        onClick={() => onChange(active ? null : "code")}
      >
        <img src="/open/code.svg" alt="" width={22} height={22} className="size-[22px]" draggable={false} />
      </TooltipTrigger>
      <TooltipContent side="bottom">Code</TooltipContent>
    </Tooltip>
  );
}
