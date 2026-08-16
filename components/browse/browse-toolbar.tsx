"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ImageIcon, Video } from "lucide-react";

import { cn } from "@/lib/utils";
import { CanvasIcon, GridIcon } from "./icons";
import type { MediaMode } from "./glass-card";

export type ViewMode = "canvas" | "grid";

const dockSpring = { type: "spring" as const, duration: 0.28, bounce: 0 };

type Option<T extends string> = {
  value: T;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const VIEW_OPTIONS: Option<ViewMode>[] = [
  { value: "canvas", label: "Canvas", icon: CanvasIcon },
  { value: "grid", label: "List", icon: GridIcon },
];

const MEDIA_OPTIONS: Option<MediaMode>[] = [
  { value: "video", label: "Live", icon: Video },
  { value: "image", label: "Still", icon: ImageIcon },
];

export function MediaToggle({
  value,
  onChange,
}: {
  value: MediaMode;
  onChange: (value: MediaMode) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Preview media"
      className="flex h-9 items-center rounded-[10px] border border-white/[0.12] bg-[#030202] p-[2px]"
    >
      {MEDIA_OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.value === "video" ? "Live previews" : "Stills"}
            title={option.value === "video" ? "Live previews" : "Stills"}
            onClick={() => onChange(option.value)}
            className={cn(
              "browse-press relative flex h-8 min-w-[70px] items-center justify-center gap-1.5 rounded-[8px] px-2.5 text-[12px] font-medium tracking-[-0.02em]",
              active ? "text-[#f7f7f7]" : "text-[#8f8f8f]",
            )}
          >
            {active ? (
              <motion.span
                layoutId="browse-media-mode"
                transition={dockSpring}
                className="absolute inset-0 rounded-[8px] bg-[#2e2e2e] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1)]"
              />
            ) : null}
            <option.icon className="relative size-3" strokeWidth={1.75} />
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function BrowseToolbar({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
      <div className="browse-toolbar pointer-events-auto flex items-center rounded-[12px] border border-white/[0.12] bg-[#030202] p-[2px]">
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
                "browse-press relative flex items-center rounded-[10px] p-[10px]",
                active ? "text-[#f7f7f7]" : "text-[#8f8f8f]",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="browse-view-mode"
                  transition={dockSpring}
                  className="absolute inset-0 rounded-[10px] bg-[#2e2e2e] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1)]"
                />
              ) : null}
              <option.icon className="relative size-[20px]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
