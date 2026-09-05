"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import * as React from "react";

import { CodeBlockCommand } from "@/components/open/code-block-command";
import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { SlidingTabs } from "@/components/open/sliding-tabs";
import { openPressMotion } from "@/components/open/ui";
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
          <span
            className="z-1 grid size-6 place-items-center rounded-lg border border-[hsl(240_4%_29%)] bg-[hsl(240_5%_21%)] text-[15px] tracking-[-0.45px] text-[hsl(240_4%_58%)] shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
            aria-hidden
          >
            {index + 1}
          </span>
          <div>{child}</div>
        </li>
      ))}
    </ol>
  );
}

function ManualDepCommand({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
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
    <div className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-[hsl(240_4%_29%)] bg-[hsl(240_6%_16%)] p-2.5">
      <p className="min-w-0 flex-1 truncate text-base tracking-[-0.48px] text-[#fafafa]">
        <span className="text-[#a38adf]">{pm}</span>
        {rest ? (
          <>
            {" "}
            <span className="text-[#9dcbff]">{rest}</span>
          </>
        ) : null}
      </p>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-9 h-[43px] w-[78px] bg-linear-to-l from-[hsl(240_6%_16%)] to-transparent"
      />
      <button
        type="button"
        className={cn("relative shrink-0", openPressMotion)}
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

/** Figma 117:3530 / 117:3531 / 117:3894 — Installation CLI | Manual */
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
    <section className="flex flex-col gap-3.5">
      <h2 className="text-lg leading-7 font-normal tracking-[-0.54px] text-white">
        Installation
      </h2>
      <div className="flex flex-col gap-3">
        <SlidingTabs
          value={mode}
          onChange={setMode}
          layoutId="open-install-mode"
          ariaLabel="Install method"
          options={[
            { value: "cli", label: "CLI" },
            { value: "manual", label: "Manual" },
          ]}
        />

        {mode === "cli" ? (
          <CodeBlockCommand
            {...commands}
            value={manager}
            onValueChange={onManagerChange}
          />
        ) : (
          <DocsSteps>
            <div className="flex flex-col gap-3">
              <h3 className="text-base leading-6 font-normal tracking-[-0.48px] text-[#fafafa]">
                Install dependencies
              </h3>
              {manualCmd ? (
                <ManualDepCommand command={manualCmd} />
              ) : (
                <p className="text-sm text-[hsl(240_5%_69%)]">
                  No extra packages configured for this component.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-base leading-6 font-normal tracking-[-0.48px] text-[#fafafa]">
                Copy the code
              </h3>
              <DocsCodeBlock
                html={codeHtml || ""}
                code={code || ""}
                title={file}
                compact
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
    </section>
  );
}
