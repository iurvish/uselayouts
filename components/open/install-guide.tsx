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
              "before:absolute before:top-[30px] before:bottom-[-28px] before:left-[13px] before:w-px before:bg-border before:content-['']",
          )}
        >
          <span
            className="z-1 grid size-7 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
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
  registryItem,
  dependencies,
  manager,
  onManagerChange,
  usageHtml,
  usage,
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
  const file = `components/${slug}.tsx`;
  const commands = {
    npm: cliInstallCommand("npm", registryItem),
    yarn: cliInstallCommand("yarn", registryItem),
    pnpm: cliInstallCommand("pnpm", registryItem),
    bun: cliInstallCommand("bun", registryItem),
  };
  const manual = {
    npm: manualInstallCommand("npm", dependencies),
    yarn: manualInstallCommand("yarn", dependencies),
    pnpm: manualInstallCommand("pnpm", dependencies),
    bun: manualInstallCommand("bun", dependencies),
  };

  return (
    <section>
      <h2 className="mt-7 mb-3.5 text-2xl font-semibold tracking-tight text-foreground text-balance">
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
        <>
          <p className="mb-2.5 text-sm leading-relaxed text-muted-foreground [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-[0.12em] [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-foreground">
            Add <code>@uselayouts</code> to <code>registries</code> in{" "}
            <code>components.json</code>, then run:
          </p>
          <CodeBlockCommand
            {...commands}
            value={manager}
            onValueChange={onManagerChange}
          />
        </>
      ) : (
        <DocsSteps>
          <div>
            <h3 className="mb-2.5 text-base font-medium tracking-tight text-foreground">
              Install the following dependencies:
            </h3>
            {manual[manager] ? (
              <CodeBlockCommand
                {...manual}
                value={manager}
                onValueChange={onManagerChange}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No extra packages configured for this component.</p>
            )}
          </div>
          <div>
            <h3 className="mb-2.5 text-base font-medium tracking-tight text-foreground">
              Copy and paste the following code into your project.
            </h3>
            <p className="mb-2.5 text-sm leading-relaxed text-muted-foreground [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-[0.12em] [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-foreground">
              Add it to <code>{file}</code>
            </p>
            <DocsCodeBlock html={codeHtml || usageHtml} code={code || usage} title={file} />
          </div>
          <div>
            <h3 className="mb-2.5 text-base font-medium tracking-tight text-foreground">
              Update your import path
            </h3>
            <p className="mb-2.5 text-sm leading-relaxed text-muted-foreground">
              Import the component and render it on the page.
            </p>
            <DocsCodeBlock html={usageHtml} code={usage} title="app/page.tsx" />
          </div>
        </DocsSteps>
      )}
    </section>
  );
}
