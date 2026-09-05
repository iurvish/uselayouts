"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import * as React from "react";

import { PackageManagerMark } from "@/components/open/pm-marks";
import { openPressMotion } from "@/components/open/ui";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  isPackageManager,
  type PackageManager,
} from "@/lib/open/package-manager";
import { cn } from "@/lib/utils";

/** Figma 116:3395 — bun-first package manager + $ command */
const COMMAND_TABS = ["bun", "npm", "yarn", "pnpm"] as const;

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
  const active = COMMAND_TABS.includes(value as (typeof COMMAND_TABS)[number])
    ? value
    : "bun";
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
      className="gap-0 overflow-hidden rounded-[10px] border border-[hsl(240_4%_29%)] bg-[hsl(240_5%_21%)]"
    >
      {/* Figma 116:3396 — pl 10 / pr 8 / py 8 */}
      <div className="flex items-center justify-between gap-2 border-b border-[hsl(240_4%_29%)] py-2 pr-2 pl-2.5">
        <TabsList className="relative z-0 h-auto w-fit gap-1.5 rounded-none bg-transparent p-0 text-[#b8b8b8]">
          {COMMAND_TABS.map((option) => (
            <TabsTrigger
              key={option}
              value={option}
              className={cn(
                "h-auto flex-none gap-1.5 rounded-md border-0 bg-transparent px-1.5 py-px text-sm font-normal tracking-[-0.42px] text-[#b8b8b8] shadow-none",
                "data-active:bg-white/14 data-active:text-white data-active:shadow-none",
                "dark:data-active:border-transparent dark:data-active:bg-white/14",
                "after:hidden",
                openPressMotion,
              )}
            >
              {option === active ? (
                <PackageManagerMark manager={option} className="size-4" />
              ) : null}
              {option}
            </TabsTrigger>
          ))}
        </TabsList>
        <button
          type="button"
          className={cn(
            "inline-flex cursor-pointer items-center overflow-hidden rounded-md p-1.5 shadow-none",
            openPressMotion,
          )}
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy"}
        >
          <img
            src={copied ? "/open/check.svg" : "/open/copy.svg"}
            alt=""
            width={16}
            height={16}
            className="size-4"
          />
        </button>
      </div>
      {COMMAND_TABS.map((option) => (
        <TabsContent key={option} value={option} className="m-0">
          {/* Figma 116:3421 — pl 15 / pr 6 / py 10 */}
          <pre className="flex items-center gap-[13px] overflow-x-auto py-2.5 pr-1.5 pl-[15px] font-mono text-sm tracking-[-0.42px]">
            <span className="shrink-0 text-[#b8b8b8]">$</span>
            <code className="text-center text-[hsl(240_5%_69%)]">{commands[option]}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
}
