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
    <div className="flex items-center justify-self-end gap-0.5 rounded-xl border border-border bg-card p-1 text-card-foreground shadow-sm">
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
          "inline-flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-foreground",
          openPress,
          "disabled:cursor-not-allowed disabled:opacity-40",
          active && "bg-accent text-accent-foreground",
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
