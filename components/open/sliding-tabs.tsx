"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

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
      className="docs-seg"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn("docs-seg-btn", active && "is-active")}
            onClick={() => onChange(option.value)}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={spring}
                className="docs-seg-pill"
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
