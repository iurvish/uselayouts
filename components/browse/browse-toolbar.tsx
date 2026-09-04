"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { CanvasIcon, GridIcon } from "./icons";

export type ViewMode = "canvas" | "grid";

const dockSpring = { type: "spring" as const, stiffness: 500, damping: 30 };

type Option = {
  value: ViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const VIEW_OPTIONS: Option[] = [
  { value: "grid", label: "List", icon: GridIcon },
  { value: "canvas", label: "Canvas", icon: CanvasIcon },
];

export function BrowseToolbar({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[34px] z-40 flex justify-center">
      <div className="pointer-events-auto flex items-center rounded-xl bg-[#161618] p-0.5 shadow-[0px_0px_0px_1px_#35353c]">
        {VIEW_OPTIONS.map((option) => {
          const active = option.value === viewMode;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onViewModeChange(option.value)}
              aria-label={option.label}
              aria-pressed={active}
              title={option.label}
              className={cn(
                "browse-press relative flex items-center rounded-[10px] p-2.5",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="browse-view-mode"
                  transition={dockSpring}
                  className="absolute inset-0 rounded-[10px] bg-accent shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.11)]"
                />
              ) : null}
              <option.icon className="relative size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
