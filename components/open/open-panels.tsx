"use client";

import * as React from "react";

import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { InstallGuide } from "@/components/open/install-guide";
import type { PackageManager } from "@/lib/open/package-manager";

/** Figma 109:500 — code preview + Installation (no Usage/Code tabs) */
export function OpenCodePanel({
  description: _description,
  docsContent,
  usageHtml,
  usage,
  codeHtml,
  code,
  cliHtml,
  manualHtml,
  registryItem,
  dependencies,
  manager,
  onManagerChange,
  slug,
}: {
  description?: string;
  docsContent?: React.ReactNode;
  usageHtml: string;
  usage: string;
  codeHtml: string;
  code: string;
  cliHtml?: Partial<Record<PackageManager, string>>;
  manualHtml?: Partial<Record<PackageManager, string>>;
  registryItem: string;
  dependencies: string[];
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
  slug: string;
}) {
  const file = `${slug}.tsx`;

  return (
    <div className="flex min-w-0 flex-col gap-[22px] pb-4">
      <DocsCodeBlock
        html={codeHtml || usageHtml}
        code={code || usage}
        title={file}
        componentSlug={slug}
      />

      <InstallGuide
        registryItem={registryItem}
        dependencies={dependencies}
        manager={manager}
        onManagerChange={onManagerChange}
        usageHtml={usageHtml}
        usage={usage}
        codeHtml={codeHtml}
        code={code}
        cliHtml={cliHtml}
        manualHtml={manualHtml}
        slug={slug}
      />

      {docsContent ? <div className="mt-1">{docsContent}</div> : null}
    </div>
  );
}
