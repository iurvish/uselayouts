"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { CanvasIcon, GridIcon, PauseIcon } from "./icons";

export type ViewMode = "canvas" | "grid";

const dockSpring = { type: "spring" as const, stiffness: 500, damping: 30 };

type Option = {
  value: ViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const VIEW_OPTIONS: Option[] = [
  { value: "grid", label: "Grid", icon: CanvasIcon },
  { value: "canvas", label: "Canvas", icon: GridIcon },
];

export function BrowseToolbar({
  viewMode,
  onViewModeChange,
  paused,
  onPausedChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  paused: boolean;
  onPausedChange: (paused: boolean) => void;
}) {
  return (
    <div className="browse-dock pointer-events-none fixed inset-x-0 bottom-[34px] z-40 flex justify-center">
      <div className="pointer-events-auto flex items-center">
        <div className="browse-dock-modes">
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
                className={cn("browse-dock-btn", active ? "text-foreground" : "text-muted-foreground")}
              >
                {active ? (
                  <motion.span
                    layoutId="browse-view-mode"
                    transition={dockSpring}
                    className="browse-dock-btn-fill"
                  />
                ) : null}
                <option.icon className="relative size-5" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- Figma connector mark, not content. */}
          <img
            src="/browse/toolbar-connector.svg"
            alt=""
            width={14}
            height={24}
            draggable={false}
            className="browse-dock-join"
          />
          <button
            type="button"
            onClick={() => onPausedChange(!paused)}
            aria-label={paused ? "Play previews" : "Pause previews"}
            aria-pressed={paused}
            title={paused ? "Play previews" : "Pause previews"}
            className="browse-dock-pause"
          >
            <PauseIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
