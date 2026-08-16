"use client";

import type { ReactNode } from "react";
import { BookOpenText, Code2, Lightbulb } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | "hint" | "docs" | null;

export function OpenActions({
  panel,
  onChange,
  hintDisabled,
}: {
  panel: OpenPanel;
  onChange: (panel: OpenPanel) => void;
  hintDisabled?: boolean;
}) {
  return (
    <div className="open-actions">
      <ActionButton
        label="Code"
        active={panel === "code"}
        onClick={() => onChange(panel === "code" ? null : "code")}
      >
        <Code2 className="size-4" strokeWidth={1.75} />
      </ActionButton>
      <ActionButton
        label={hintDisabled ? "No hints yet" : "Hint"}
        active={panel === "hint"}
        disabled={hintDisabled}
        onClick={() => onChange(panel === "hint" ? null : "hint")}
      >
        <Lightbulb className="size-4" strokeWidth={1.75} />
      </ActionButton>
      <ActionButton
        label="See the doc"
        active={panel === "docs"}
        onClick={() => onChange(panel === "docs" ? null : "docs")}
      >
        <BookOpenText className="size-4" strokeWidth={1.75} />
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
        className={cn("open-icon-btn", active && "is-active")}
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
