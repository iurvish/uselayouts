"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { openPress } from "@/components/open/ui";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, duration: 0.28, bounce: 0 };

export type SlidingTab<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

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
      className="mb-4 flex w-fit rounded-[10px] border border-white/12 bg-[#030202] p-0.5"
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
              "relative flex min-h-8 items-center justify-center gap-1.5 rounded-lg border-0 bg-transparent px-3 text-xs font-medium tracking-[-0.02em] text-[#8f8f8f]",
              openPress,
              active && "text-[#f7f7f7]",
            )}
            onClick={() => onChange(option.value)}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={spring}
                className="absolute inset-0 rounded-lg bg-[#2e2e2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
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
