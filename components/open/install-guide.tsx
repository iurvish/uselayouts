"use client";

import * as React from "react";

import { CodeBlockCommand } from "@/components/open/code-block-command";
import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { SlidingTabs } from "@/components/open/sliding-tabs";
import {
  cliInstallCommand,
  manualInstallCommand,
  type PackageManager,
} from "@/lib/open/package-manager";
import { cn } from "@/lib/utils";

export function DocsSteps({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <ol className="relative my-2 mb-3 grid list-none gap-7 p-0">
      {items.map((child, index) => (
        <li
          key={index}
          className={cn(
            "relative grid grid-cols-[28px_minmax(0,1fr)] gap-3.5",
            index !== items.length - 1 &&
              "before:absolute before:top-[30px] before:bottom-[-28px] before:left-[13px] before:w-px before:bg-white/12 before:content-['']",
          )}
        >
          <span
            className="z-[1] grid size-7 place-items-center rounded-full bg-[#2a2a2a] text-xs font-semibold text-white"
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

export function InstallGuide({
  registryUrl,
  dependencies,
  manager,
  onManagerChange,
  usageHtml,
  usage,
  codeHtml,
  code,
  slug,
}: {
  registryUrl: string;
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
  const file = `components/${slug}.tsx`;
  const commands = {
    npm: cliInstallCommand("npm", registryUrl),
    yarn: cliInstallCommand("yarn", registryUrl),
    pnpm: cliInstallCommand("pnpm", registryUrl),
    bun: cliInstallCommand("bun", registryUrl),
  };
  const manual = {
    npm: manualInstallCommand("npm", dependencies),
    yarn: manualInstallCommand("yarn", dependencies),
    pnpm: manualInstallCommand("pnpm", dependencies),
    bun: manualInstallCommand("bun", dependencies),
  };

  return (
    <section>
      <h2 className="mt-7 mb-3.5 text-2xl font-[650] tracking-[-0.03em] text-white text-balance">
        Installation
      </h2>
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
          <div>
            <h3 className="mb-2.5 text-[15px] font-[550] tracking-[-0.02em] text-[#f4f4f4]">
              Install the following dependencies:
            </h3>
            {manual[manager] ? (
              <CodeBlockCommand
                {...manual}
                value={manager}
                onValueChange={onManagerChange}
              />
            ) : (
              <p className="text-[13px] text-[#8f8f8f]">No extra packages configured for this component.</p>
            )}
          </div>
          <div>
            <h3 className="mb-2.5 text-[15px] font-[550] tracking-[-0.02em] text-[#f4f4f4]">
              Copy and paste the following code into your project.
            </h3>
            <p className="mb-2.5 text-[13.5px] leading-[1.6] text-[#a3a3a3] [&_code]:rounded-md [&_code]:bg-[#1c1c1c] [&_code]:px-1.5 [&_code]:py-[0.12em] [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-[#e8c4a8]">
              Add it to <code>{file}</code>
            </p>
            <DocsCodeBlock html={codeHtml || usageHtml} code={code || usage} title={file} />
          </div>
          <div>
            <h3 className="mb-2.5 text-[15px] font-[550] tracking-[-0.02em] text-[#f4f4f4]">
              Update your import path
            </h3>
            <p className="mb-2.5 text-[13.5px] leading-[1.6] text-[#a3a3a3]">
              Import the component and render it on the page.
            </p>
            <DocsCodeBlock html={usageHtml} code={usage} title="app/page.tsx" />
          </div>
        </DocsSteps>
      )}
    </section>
  );
}
