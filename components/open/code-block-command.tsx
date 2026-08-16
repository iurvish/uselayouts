"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { IconSwap, IconSwapItem } from "@/components/open/icon-swap";
import { PackageManagerMark } from "@/components/open/pm-marks";
import { openCopyBtn } from "@/components/open/ui";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  isPackageManager,
  type PackageManager,
} from "@/lib/open/package-manager";

const COMMAND_TABS = ["pnpm", "yarn", "npm", "bun"] as const;

export function CodeBlockCommand({
  npm,
  yarn,
  pnpm,
  bun,
  value,
  onValueChange,
}: {
  npm: string;
  yarn: string;
  pnpm: string;
  bun: string;
  value: PackageManager;
  onValueChange: (manager: PackageManager) => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const commands: Record<PackageManager, string> = { npm, yarn, pnpm, bun };
  const active = COMMAND_TABS.includes(value as (typeof COMMAND_TABS)[number]) ? value : "pnpm";
  const command = commands[active];

  async function copy() {
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Tabs
      value={active}
      onValueChange={(next) => {
        if (typeof next === "string" && isPackageManager(next)) onValueChange(next);
      }}
      className="my-3 mb-5 gap-0 overflow-hidden rounded-xl border border-white/12 bg-[#0a0a0a]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/8 px-2 py-1.5">
        <TabsList className="relative z-0 h-8 w-fit rounded-lg bg-zinc-50 p-0.5 text-muted-foreground inset-ring-1 inset-ring-border/64 dark:bg-zinc-900">
          <TabsIndicator className="rounded-md bg-white dark:bg-muted" />
          {COMMAND_TABS.map((option) => (
            <TabsTrigger
              key={option}
              value={option}
              className="h-7 flex-none gap-1.5 px-2.5 text-xs text-[#8f8f8f] hover:text-foreground data-active:bg-transparent data-active:text-[#f7f7f7] data-active:shadow-none dark:data-active:bg-transparent"
            >
              <PackageManagerMark manager={option} className="size-3.5" />
              {option}
            </TabsTrigger>
          ))}
        </TabsList>
        <button type="button" className={openCopyBtn} onClick={copy} aria-label={copied ? "Copied" : "Copy"}>
          <IconSwap>
            {copied ? (
              <IconSwapItem key="copied" className="flex items-center">
                <Check className="size-3.5" strokeWidth={1.75} />
              </IconSwapItem>
            ) : (
              <IconSwapItem key="copy" className="flex items-center">
                <Copy className="size-3.5" strokeWidth={1.75} />
              </IconSwapItem>
            )}
          </IconSwap>
        </button>
      </div>
      {COMMAND_TABS.map((option) => (
        <TabsContent key={option} value={option} className="m-0">
          <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] text-[#e6e6e6] hover:text-white">
            <code>{commands[option]}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
}
