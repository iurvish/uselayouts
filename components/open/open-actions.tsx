"use client";

import { Code2 } from "lucide-react";

import { openPressMotion } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

const primaryBlue = "hsl(230 77% 55%)";

/** Figma/Paper primary code button — keeps blue on hover (no accent wash). */
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
          "relative inline-flex items-center justify-center overflow-hidden rounded-xl border-0 p-2.5 text-white",
          "outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
          "shadow-[0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.12)]",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0_0.2px_hsla(0,0%,100%,0.16)]",
          openPressMotion,
        )}
        style={{ backgroundColor: primaryBlue }}
        aria-label="Code"
        aria-pressed={active}
        onClick={() => onChange(active ? null : "code")}
      >
        <Code2 className="relative size-[22px]" strokeWidth={1.75} />
      </TooltipTrigger>
      <TooltipContent side="bottom">Code</TooltipContent>
    </Tooltip>
  );
}
