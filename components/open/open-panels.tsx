"use client";

import * as React from "react";

import { OpenCopyButton } from "@/components/open/copy-button";
import { PackageManagerMark } from "@/components/open/pm-marks";
import {
  PACKAGE_MANAGERS,
  cliInstallCommand,
  manualInstallCommand,
  type PackageManager,
} from "@/lib/open/package-manager";
import { cn } from "@/lib/utils";

export function OpenCodePanel({
  usageHtml,
  usage,
  codeHtml,
  code,
  registryUrl,
  dependencies,
  manager,
  onManagerChange,
}: {
  usageHtml: string;
  usage: string;
  codeHtml: string;
  code: string;
  registryUrl: string;
  dependencies: string[];
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
}) {
  const [tab, setTab] = React.useState<"usage" | "code">("usage");
  const cli = cliInstallCommand(manager, registryUrl);
  const manual = manualInstallCommand(manager, dependencies);

  return (
    <div className="open-code-panel">
      <div className="open-tabs" role="tablist" aria-label="Source">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "usage"}
          className={cn("open-tab", tab === "usage" && "is-active")}
          onClick={() => setTab("usage")}
        >
          Usage
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "code"}
          className={cn("open-tab", tab === "code" && "is-active")}
          onClick={() => setTab("code")}
        >
          Code
        </button>
      </div>

      <div className="open-code-frame">
        <div className="open-code-block-bar">
          <span>{tab === "usage" ? "page.tsx" : "component.tsx"}</span>
          <OpenCopyButton
            value={tab === "usage" ? usage : code}
            label="Copy"
            className="open-text-copy"
          >
            Copy
          </OpenCopyButton>
        </div>
        <div
          className="open-shiki"
          dangerouslySetInnerHTML={{ __html: tab === "usage" ? usageHtml : codeHtml || "<pre><code>No source yet.</code></pre>" }}
        />
      </div>

      <section className="open-install">
        <h3>Installation</h3>
        <div className="open-pm-row" role="tablist" aria-label="Package manager">
          {PACKAGE_MANAGERS.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={option === manager}
              className={cn("open-pm-chip", option === manager && "is-active")}
              onClick={() => onManagerChange(option)}
            >
              <PackageManagerMark manager={option} className="size-3.5" />
              {option}
            </button>
          ))}
        </div>

        <div className="open-code-frame">
          <div className="open-code-block-bar">
            <span>CLI</span>
            <OpenCopyButton value={cli} label="Copy" className="open-text-copy">
              Copy
            </OpenCopyButton>
          </div>
          <pre>
            <code>{cli}</code>
          </pre>
        </div>

        <div className="open-code-frame">
          <div className="open-code-block-bar">
            <span>Manual</span>
            {manual ? (
              <OpenCopyButton value={manual} label="Copy" className="open-text-copy">
                Copy
              </OpenCopyButton>
            ) : null}
          </div>
          {manual ? (
            <pre>
              <code>{manual}</code>
            </pre>
          ) : (
            <p className="open-empty">No extra packages configured for this component.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function OpenHintPanel({ hints }: { hints: string[] }) {
  if (hints.length === 0) {
    return <p className="open-empty">No hints yet.</p>;
  }
  return (
    <ul className="open-hint-list">
      {hints.map((hint) => (
        <li key={hint}>{hint}</li>
      ))}
    </ul>
  );
}

export function OpenDocsPanel({
  description,
  docs,
}: {
  description: string;
  docs: { title: string; html: string }[];
}) {
  return (
    <div className="open-docs">
      {description ? <p className="open-docs-lede">{description}</p> : null}
      {docs.length === 0 ? (
        <p className="open-empty">No additional documentation yet.</p>
      ) : (
        docs.map((section) => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: section.html }} />
          </section>
        ))
      )}
    </div>
  );
}
