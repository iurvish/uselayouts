"use client";

/* eslint-disable @next/next/no-img-element -- Paper-exported marks. */

import { openPressMotion } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

/** Paper GR-0 / NW-0 — primary code button (blue stays blue on hover). */
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
          "hover:bg-[hsl(230_77%_55%)] hover:text-white active:bg-[hsl(230_77%_55%)]",
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
