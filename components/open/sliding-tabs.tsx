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
      className="mb-4 flex w-fit rounded-lg border border-border bg-muted p-0.5"
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
              "relative flex min-h-8 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-3 text-xs font-medium tracking-tight text-muted-foreground",
              openPress,
              active && "text-foreground",
            )}
            onClick={() => onChange(option.value)}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={spring}
                className="absolute inset-0 rounded-md bg-accent shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_10%,transparent)]"
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
