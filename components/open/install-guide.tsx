"use client";

import * as React from "react";

import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { PackageManagerMark } from "@/components/open/pm-marks";
import { SlidingTabs } from "@/components/open/sliding-tabs";
import {
  PACKAGE_MANAGERS,
  cliInstallCommand,
  manualInstallCommand,
  type PackageManager,
} from "@/lib/open/package-manager";
import { cn } from "@/lib/utils";

export function PackageCommand({
  manager,
  onManagerChange,
  command,
  layoutId,
}: {
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
  command: string;
  layoutId: string;
}) {
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

  return (
    <div className="docs-cmd">
      <div className="docs-cmd-bar">
        <SlidingTabs
          value={manager}
          onChange={onManagerChange}
          layoutId={layoutId}
          ariaLabel="Package manager"
          options={PACKAGE_MANAGERS.map((option) => ({
            value: option,
            label: option,
            icon: <PackageManagerMark manager={option} className="size-3.5" />,
          }))}
        />
        <button type="button" className="docs-copy" onClick={copy} aria-label={copied ? "Copied" : "Copy"}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <button type="button" className="docs-cmd-line" onClick={copy}>
        {copied ? "Copied" : <code>{command}</code>}
      </button>
    </div>
  );
}

export function DocsSteps({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <ol className="docs-steps">
      {items.map((child, index) => (
        <li key={index} className={cn("docs-step", index === items.length - 1 && "is-last")}>
          <span className="docs-step-num" aria-hidden>
            {index + 1}
          </span>
          <div className="docs-step-body">{child}</div>
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
  const cli = cliInstallCommand(manager, registryUrl);
  const manual = manualInstallCommand(manager, dependencies);
  const file = `components/${slug}.tsx`;

  return (
    <section className="docs-install">
      <h2 className="docs-h2">Installation</h2>
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
        <PackageCommand
          manager={manager}
          onManagerChange={onManagerChange}
          command={cli}
          layoutId="open-install-pm"
        />
      ) : (
        <DocsSteps>
          <div>
            <h3 className="docs-h3">Install the following dependencies:</h3>
            {manual ? (
              <PackageCommand
                manager={manager}
                onManagerChange={onManagerChange}
                command={manual}
                layoutId="open-manual-pm"
              />
            ) : (
              <p className="docs-muted">No extra packages configured for this component.</p>
            )}
          </div>
          <div>
            <h3 className="docs-h3">Copy and paste the following code into your project.</h3>
            <p className="docs-copy-lead">
              Add it to <code>{file}</code>
            </p>
            <DocsCodeBlock html={codeHtml || usageHtml} code={code || usage} title={file} />
          </div>
          <div>
            <h3 className="docs-h3">Update your import path</h3>
            <p className="docs-copy-lead">Import the component and render it on the page.</p>
            <DocsCodeBlock html={usageHtml} code={usage} title="app/page.tsx" />
          </div>
        </DocsSteps>
      )}
    </section>
  );
}
