"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { ProfileDialog } from "@/components/account/profile-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { CodeBlockCommand } from "@/components/open/code-block-command";
import { DocsSteps } from "@/components/open/docs-steps";
import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { openPressMotion, shikiCommandSurface } from "@/components/open/ui";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGatedCopy, type CopySource } from "@/hooks/use-gated-copy";
import {
  cliInstallCommand,
  manualInstallCommand,
  type PackageManager,
} from "@/lib/open/package-manager";
import { cn } from "@/lib/utils";

/** Same spring as browse dock Grid/Canvas tabs. */
const installModeSpring = { type: "spring" as const, stiffness: 500, damping: 30 };

function ManualDepCommand({
  command,
  html,
  componentSlug,
  source = "manual_deps",
}: {
  command: string;
  html: string;
  componentSlug?: string;
  source?: CopySource;
}) {
  const [copied, setCopied] = React.useState(false);
  const gatedCopy = useGatedCopy({
    componentSlug,
    source,
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

  return (
    <div className="relative flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-[#47474d] bg-[hsl(240_6%_20%)] p-2 shadow-[0_1.5px_2px_0_rgba(0,0,0,0.32),0_0_0_1px_rgba(255,255,255,0.1)]">
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div
          className={shikiCommandSurface}
          dangerouslySetInnerHTML={{
            __html: html || `<pre><code>${command}</code></pre>`,
          }}
        />
        {/* Same fade idea as DocsCodeBlock — right edge under the copy control */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-[hsl(240_6%_20%)] to-transparent" />
      </div>
      <button
        type="button"
        className={cn(
          "relative z-[1] shrink-0 cursor-pointer rounded-md p-1",
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
  );
}

/** The key lives in the profile dialog; signing in first is the only way to it. */
function McpSteps({ slug }: { slug: string }) {
  const { requireAuth } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const prompt = `Use the uselayouts MCP to add the ${slug} component to this project`;

  return (
    <DocsSteps>
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="text-base leading-6 font-normal tracking-[-0.48px] text-[#fafafa]">
          Connect your editor
        </h3>
        <p className="text-base leading-[1.3] tracking-[-0.16px] text-[hsl(240_5%_69%)]">
          Once per editor. Generate an API key, then paste the setup into Claude Code, Cursor, or
          VS Code.
        </p>
        <button
          type="button"
          onClick={() => void requireAuth(() => setProfileOpen(true))}
          className={cn(
            "relative w-fit cursor-pointer overflow-clip rounded-[10px] bg-[hsl(230_77%_55%)] px-3 py-1.5 text-[14px] leading-5 font-medium tracking-[-0.084px] text-white",
            "shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.12)]",
            "transition-[transform,background-color] duration-150 active:scale-[0.98]",
            "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
          )}
        >
          Get your API key
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0.2px_rgba(255,255,255,0.16)]"
          />
        </button>
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="text-base leading-6 font-normal tracking-[-0.48px] text-[#fafafa]">
          Ask for it
        </h3>
        <ManualDepCommand command={prompt} html="" componentSlug={slug} source="mcp" />
      </div>
    </DocsSteps>
  );
}

/** Paper 114-0 / 117-0 — Installation CLI | Manual | MCP */
export function InstallGuide({
  registryItem,
  dependencies,
  manager,
  onManagerChange,
  usageHtml: _usageHtml,
  usage: _usage,
  codeHtml,
  code,
  cliHtml,
  manualHtml,
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
  cliHtml?: Partial<Record<PackageManager, string>>;
  manualHtml?: Partial<Record<PackageManager, string>>;
  slug: string;
}) {
  const [mode, setMode] = React.useState<"cli" | "manual" | "mcp">("cli");
  const reduceMotion = useReducedMotion();
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
          if (next === "cli" || next === "manual" || next === "mcp") setMode(next);
        }}
        className="flex min-w-0 flex-col gap-3"
      >
        {/* Figma 114:3098 — track 12 / pad 2 / pill 10; sliding fill like browse dock */}
        <TabsList
          className={cn(
            "mb-0 h-auto w-fit gap-0 overflow-hidden rounded-[12px] bg-[#161618] p-0.5",
            "group-data-horizontal/tabs:h-auto",
            "text-[#acacb4]",
          )}
        >
          {(
            [
              { value: "cli", label: "CLI" },
              { value: "manual", label: "Manual" },
              { value: "mcp", label: "MCP" },
            ] as const
          ).map((option) => {
            const active = option.value === mode;
            return (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className={cn(
                  "relative z-1 h-auto flex-none cursor-pointer rounded-[10px] border-0 bg-transparent px-2.5 py-1.5 text-base leading-5 font-normal tracking-[-0.48px] shadow-none",
                  "text-[#acacb4] data-active:bg-transparent data-active:text-white data-active:shadow-none",
                  "dark:data-active:border-transparent dark:data-active:bg-transparent",
                  "after:hidden",
                  openPressMotion,
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="install-mode"
                    transition={
                      reduceMotion ? { duration: 0 } : installModeSpring
                    }
                    className="absolute inset-0 rounded-[10px] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.11)]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgb(0 0 0 / 0%) 0%, rgb(0 0 0 / 2%) 100%), #3f3f48",
                    }}
                  />
                ) : null}
                <span className="relative">{option.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="min-w-0">
          {mode === "cli" ? (
            <CodeBlockCommand
              {...commands}
              html={cliHtml ?? {}}
              value={manager}
              onValueChange={onManagerChange}
              componentSlug={slug}
            />
          ) : mode === "mcp" ? (
            <McpSteps slug={slug} />
          ) : (
            <DocsSteps>
              <div className="flex min-w-0 flex-col gap-3">
                <h3 className="text-base leading-6 font-normal tracking-[-0.48px] text-[#fafafa]">
                  Install dependencies
                </h3>
                {manualCmd ? (
                  <ManualDepCommand
                    command={manualCmd}
                    html={manualHtml?.[manager] || ""}
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
