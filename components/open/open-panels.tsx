"use client";

import * as React from "react";

import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { InstallGuide } from "@/components/open/install-guide";
import { SlidingTabs } from "@/components/open/sliding-tabs";
import type { PackageManager } from "@/lib/open/package-manager";

export function OpenCodePanel({
  description,
  docsContent,
  usageHtml,
  usage,
  codeHtml,
  code,
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
  registryItem: string;
  dependencies: string[];
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
  slug: string;
}) {
  const [tab, setTab] = React.useState<"usage" | "code">("usage");

  return (
    <div className="pb-7">
      {description ? (
        <p className="mb-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}

      <SlidingTabs
        value={tab}
        onChange={setTab}
        layoutId="open-source-tab"
        ariaLabel="Source"
        options={[
          { value: "usage", label: "Usage" },
          { value: "code", label: "Code" },
        ]}
      />

      <DocsCodeBlock
        html={tab === "usage" ? usageHtml : codeHtml}
        code={tab === "usage" ? usage : code}
        title={tab === "usage" ? "app/page.tsx" : `components/${slug}.tsx`}
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
        slug={slug}
      />

      {docsContent ? <div className="mt-2">{docsContent}</div> : null}
    </div>
  );
}
