"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { openPressMotion } from "@/components/open/ui";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, duration: 0.28, bounce: 0 };

export type SlidingTab<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

/** Figma 114:3098 / 117:3897 — CLI | Manual segmented control */
export function SlidingTabs<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SlidingTab<T>[];
  layoutId: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="mb-0 flex w-fit overflow-hidden rounded-xl bg-[hsl(240_5%_9%)] p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-[10px] border-0 bg-transparent px-2.5 py-1.5 text-base tracking-[-0.48px]",
              openPressMotion,
              active ? "text-white" : "text-[hsl(240_5%_69%)]",
            )}
            onClick={() => onChange(option.value)}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={spring}
                className="absolute inset-0 rounded-[10px] bg-[hsl(240_7%_26%)] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.11)]"
              />
            ) : null}
            {option.icon ? <span className="relative">{option.icon}</span> : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
