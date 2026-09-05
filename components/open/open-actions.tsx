"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import type { ReactNode } from "react";
import { Code2 } from "lucide-react";

import { openPress } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

/** Figma 102:720 — standalone primary code button */
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
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-xl border-0 p-2.5 text-white outline-none",
          "bg-[hsl(230_77%_55%)] shadow-[0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.12)]",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0_0.2px_hsla(0,0%,100%,0.16)]",
          openPress,
          "hover:brightness-110",
          active && "brightness-110",
        )}
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
