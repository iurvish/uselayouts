"use client";

import type { ReactNode } from "react";
import { Code2 } from "lucide-react";

import { openPress } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

export function OpenActions({
  panel,
  onChange,
}: {
  panel: OpenPanel;
  onChange: (panel: OpenPanel) => void;
}) {
  return (
    <div className="flex items-center justify-self-end gap-0.5 rounded-xl border-0 bg-secondary p-1 text-secondary-foreground shadow-[0_2px_2px_-1px_rgba(0,0,0,0.16),0_4px_4px_-2px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.1)]">
      <ActionButton
        label="Code"
        active={panel === "code"}
        onClick={() => onChange(panel === "code" ? null : "code")}
      >
        <Code2 className="size-4" strokeWidth={1.75} />
      </ActionButton>
    </div>
  );
}

function ActionButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-foreground outline-none focus-visible:outline-none focus-visible:ring-0",
          openPress,
          "disabled:cursor-not-allowed disabled:opacity-40",
          active && "bg-primary text-primary-foreground",
        )}
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
