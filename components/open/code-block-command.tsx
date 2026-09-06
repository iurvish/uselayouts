"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import * as React from "react";

import { PackageManagerMark } from "@/components/open/pm-marks";
import { openPressMotion, shikiCommandSurface } from "@/components/open/ui";
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
import { useGatedCopy } from "@/hooks/use-gated-copy";
import { cn } from "@/lib/utils";

/** Paper 114-0 / 11I-0 — bun-first package manager + $ command */
const COMMAND_TABS = ["bun", "npm", "yarn", "pnpm"] as const;

export function CodeBlockCommand({
  npm,
  yarn,
  pnpm,
  bun,
  html = {},
  value,
  onValueChange,
  componentSlug,
}: {
  npm: string;
  yarn: string;
  pnpm: string;
  bun: string;
  /** Pre-highlighted shell HTML per manager; missing keys fall back to plain `commands`. */
  html?: Partial<Record<PackageManager, string>>;
  value: PackageManager;
  onValueChange: (manager: PackageManager) => void;
  componentSlug?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const commands: Record<PackageManager, string> = { npm, yarn, pnpm, bun };
  const active = COMMAND_TABS.includes(value as (typeof COMMAND_TABS)[number])
    ? value
    : "bun";
  const command = commands[active];
  const gatedCopy = useGatedCopy({
    componentSlug,
    source: "cli",
  });

  async function copy() {
    if (!command) return;
    try {
      const ok = await gatedCopy(command);
      if (!ok) return;
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
      className="min-w-0 gap-0 overflow-hidden rounded-[10px] border border-[#47474d] bg-[#323239]"
    >
      {/* Paper 11I-0 — pl 10 / pr 8 / py 8; PM pills use highlighter command color */}
      <div className="flex min-w-0 items-center justify-between gap-2 border-b border-[#47474d] py-2 pr-2 pl-2.5">
        <TabsList className="relative z-0 h-auto w-fit gap-1.5 rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-auto">
          {COMMAND_TABS.map((option) => (
            <TabsTrigger
              key={option}
              value={option}
              className={cn(
                "h-auto flex-none cursor-pointer gap-1 rounded-md border-0 bg-transparent px-1.5 py-px text-xs leading-5 font-normal tracking-[-0.03em] shadow-none",
                /* Vesper dark shell-command token (same as highlightCode bash) */
                "text-[#FFC799]/55",
                "data-active:bg-[#ffffff24] data-active:text-[#FFC799] data-active:shadow-none",
                "dark:data-active:border-transparent dark:data-active:bg-[#ffffff24]",
                "after:hidden",
                openPressMotion,
              )}
            >
              {option === active ? (
                <PackageManagerMark manager={option} className="size-3.5" />
              ) : null}
              {option}
            </TabsTrigger>
          ))}
        </TabsList>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center overflow-hidden rounded-md p-1.5 shadow-none",
            openPressMotion,
          )}
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy"}
        >
          <img
            src={copied ? "/open/check.svg" : "/open/copy.svg"}
            alt=""
            width={14}
            height={14}
            className="size-3.5"
          />
        </button>
      </div>
      {COMMAND_TABS.map((option) => (
        <TabsContent key={option} value={option} className="m-0 min-w-0">
          <div className="relative flex min-w-0 items-center gap-1 overflow-hidden py-1.5 pr-2 pl-1.5">
            <span className="shrink-0 font-mono text-[13px] leading-[19.5px] text-[#b8b8b8]">
              $
            </span>
            <div
              className={cn(shikiCommandSurface, "min-w-0 flex-1")}
              dangerouslySetInnerHTML={{
                __html: html[option] || `<pre><code>${commands[option]}</code></pre>`,
              }}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#323239] to-transparent" />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
