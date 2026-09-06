"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import * as React from "react";

import { CodeBlockCommand } from "@/components/open/code-block-command";
import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { openPressMotion } from "@/components/open/ui";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGatedCopy } from "@/hooks/use-gated-copy";
import {
  cliInstallCommand,
  manualInstallCommand,
  type PackageManager,
} from "@/lib/open/package-manager";
import { cn } from "@/lib/utils";

/** Figma 117:3894 — numbered steps with #47474d connectors */
export function DocsSteps({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <ol className="relative my-0 grid list-none gap-0 p-0">
      {items.map((child, index) => (
        <li
          key={index}
          className={cn(
            "relative grid grid-cols-[24px_minmax(0,1fr)] gap-3",
            index !== items.length - 1 && "pb-4",
            index !== items.length - 1 &&
              "before:absolute before:top-6 before:bottom-0 before:left-3 before:w-px before:-translate-x-1/2 before:bg-[hsl(240_4%_29%)] before:content-['']",
          )}
        >
          {/* Figma 120:43 — 24px, radius 8, fill #323239, outer ring + inset highlight */}
          <span
            className={cn(
              "relative z-1 grid size-6 place-items-center overflow-hidden rounded-md border border-[hsl(240_4%_29%)] bg-[hsl(240_5%_21%)] text-[15px] tracking-[-0.45px] text-[hsl(240_4%_58%)]",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",
              "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
              "after:shadow-[inset_0_1px_0.5px_0_hsla(0,0%,100%,0.08)]",
            )}
            aria-hidden
          >
            <span className="relative">{index + 1}</span>
          </span>
          <div className="min-w-0">{child}</div>
        </li>
      ))}
    </ol>
  );
}

function ManualDepCommand({
  command,
  componentSlug,
}: {
  command: string;
  componentSlug?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const gatedCopy = useGatedCopy({
    componentSlug,
    source: "manual_deps",
  });

  async function copy() {
    try {
      const ok = await gatedCopy(command);
      if (!ok) return;
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const firstSpace = command.indexOf(" ");
  const pm = firstSpace === -1 ? command : command.slice(0, firstSpace);
  const rest = firstSpace === -1 ? "" : command.slice(firstSpace + 1);

  return (
    <div className="relative flex min-w-0 items-center gap-2.5 rounded-xl border border-[#47474d] bg-[#26262b] p-2.5">
      <p className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-base tracking-[-0.48px] text-[#fafafa]">
        <span className="text-[#a38adf]">{pm}</span>
        {rest ? (
          <>
            {" "}
            <span className="text-[#9dcbff]">{rest}</span>
          </>
        ) : null}
      </p>
      <button
        type="button"
        className={cn("relative shrink-0 cursor-pointer", openPressMotion)}
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy"}
      >
        <img
          src={copied ? "/open/check.svg" : "/open/copy-white-18.svg"}
          alt=""
          width={18}
          height={18}
          className="size-[18px]"
        />
      </button>
    </div>
  );
}

/** Paper 114-0 / 117-0 — Installation CLI | Manual */
export function InstallGuide({
  registryItem,
  dependencies,
  manager,
  onManagerChange,
  usageHtml: _usageHtml,
  usage: _usage,
  codeHtml,
  code,
  slug,
}: {
  registryItem: string;
  dependencies: string[];
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
  usageHtml: string;
  usage: string;
  codeHtml: string;
  code: string;
  slug: string;
}) {
  const [mode, setMode] = React.useState<"cli" | "manual">("cli");
  const file = `${slug}.tsx`;
  const commands = {
    npm: cliInstallCommand("npm", registryItem),
    yarn: cliInstallCommand("yarn", registryItem),
    pnpm: cliInstallCommand("pnpm", registryItem),
    bun: cliInstallCommand("bun", registryItem),
  };
  const manualCmd = manualInstallCommand(manager, dependencies);

  return (
    <section className="flex min-w-0 flex-col gap-3.5">
      <h2 className="text-lg leading-7 font-normal tracking-[-0.03em] text-white">
        Installation
      </h2>
      <Tabs
        value={mode}
        onValueChange={(next) => {
          if (next === "cli" || next === "manual") setMode(next);
        }}
        className="flex min-w-0 flex-col gap-3"
      >
        {/* Paper 117-0 — static segmented control, no sliding indicator */}
        <TabsList
          className={cn(
            "mb-0 h-auto w-fit gap-0 overflow-clip rounded-xl bg-[#161618] p-0.5",
            "text-[#acacb4]",
          )}
        >
          {(
            [
              { value: "cli", label: "CLI" },
              { value: "manual", label: "Manual" },
            ] as const
          ).map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className={cn(
                "relative z-1 h-auto flex-none rounded-[10px] border-0 bg-transparent px-2.5 py-1.5 text-base leading-5 font-normal tracking-[-0.03em] shadow-none",
                "text-[#acacb4] data-active:bg-[#3f3f48] data-active:text-white data-active:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.11)]",
                "dark:data-active:border-transparent dark:data-active:bg-[#3f3f48]",
                "after:hidden",
                openPressMotion,
              )}
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-w-0">
          {mode === "cli" ? (
            <CodeBlockCommand
              {...commands}
              value={manager}
              onValueChange={onManagerChange}
              componentSlug={slug}
            />
          ) : (
            <DocsSteps>
              <div className="flex min-w-0 flex-col gap-3">
                <h3 className="text-base leading-6 font-normal tracking-[-0.48px] text-[#fafafa]">
                  Install dependencies
                </h3>
                {manualCmd ? (
                  <ManualDepCommand
                    command={manualCmd}
                    componentSlug={slug}
                  />
                ) : (
                  <p className="text-sm text-[hsl(240_5%_69%)]">
                    No extra packages configured for this component.
                  </p>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <h3 className="text-base leading-6 font-normal tracking-[-0.48px] text-[#fafafa]">
                  Copy the code
                </h3>
                <DocsCodeBlock
                  html={codeHtml || ""}
                  code={code || ""}
                  title={file}
                  compact
                  componentSlug={slug}
                />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-base leading-6 font-normal tracking-[-0.48px] text-[#fafafa]">
                  Update imports
                </h3>
                <p className="text-base leading-[1.3] tracking-[-0.16px] text-[hsl(240_5%_69%)]">
                  Update the imports to match your project structure.
                </p>
              </div>
            </DocsSteps>
          )}
        </div>
      </Tabs>
    </section>
  );
}
