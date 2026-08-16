"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { IconSwap, IconSwapItem } from "@/components/open/icon-swap";
import { openPress } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function OpenCopyButton({
  value,
  label = "Copy",
  className,
  children,
}: {
  value: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        className={cn(openPress, className)}
        aria-label={copied ? "Copied successfully!" : label}
        onClick={onCopy}
      >
        <IconSwap>
          {copied ? (
            <IconSwapItem key="copied" className="flex items-center gap-1.5">
              <Check className="size-3.5" strokeWidth={1.75} />
              {children ? null : <span>Copied</span>}
            </IconSwapItem>
          ) : (
            <IconSwapItem key="copy" className="flex items-center gap-1.5">
              {children ?? (
                <>
                  <Copy className="size-3.5" strokeWidth={1.75} />
                  <span>{label}</span>
                </>
              )}
            </IconSwapItem>
          )}
        </IconSwap>
      </TooltipTrigger>
      <TooltipContent side="top">{copied ? "Copied successfully!" : label}</TooltipContent>
    </Tooltip>
  );
}
