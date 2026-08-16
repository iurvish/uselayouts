"use client";

import * as React from "react";

import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { InstallGuide } from "@/components/open/install-guide";
import { SlidingTabs } from "@/components/open/sliding-tabs";
import type { PackageManager } from "@/lib/open/package-manager";

export function OpenCodePanel({
  usageHtml,
  usage,
  codeHtml,
  code,
  registryUrl,
  dependencies,
  manager,
  onManagerChange,
  slug,
}: {
  usageHtml: string;
  usage: string;
  codeHtml: string;
  code: string;
  registryUrl: string;
  dependencies: string[];
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
  slug: string;
}) {
  const [tab, setTab] = React.useState<"usage" | "code">("usage");

  return (
    <div className="docs-panel">
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
        registryUrl={registryUrl}
        dependencies={dependencies}
        manager={manager}
        onManagerChange={onManagerChange}
        usageHtml={usageHtml}
        usage={usage}
        codeHtml={codeHtml}
        code={code}
        slug={slug}
      />
    </div>
  );
}

export function OpenHintPanel({ hints }: { hints: string[] }) {
  if (hints.length === 0) {
    return <p className="docs-muted">No hints yet.</p>;
  }
  return (
    <ul className="docs-hints">
      {hints.map((hint) => (
        <li key={hint}>{hint}</li>
      ))}
    </ul>
  );
}

export function OpenDocsPanel({
  description,
  docs,
  slug,
  usage,
  usageHtml,
  code,
  codeHtml,
  registryUrl,
  dependencies,
  manager,
  onManagerChange,
}: {
  description: string;
  docs: { title: string; html: string }[];
  slug: string;
  usage: string;
  usageHtml: string;
  code: string;
  codeHtml: string;
  registryUrl: string;
  dependencies: string[];
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
}) {
  const extra = docs.filter((section) => !/^usage$/i.test(section.title));

  return (
    <div className="docs-article">
      {description ? <p className="docs-lede">{description}</p> : null}

      <InstallGuide
        registryUrl={registryUrl}
        dependencies={dependencies}
        manager={manager}
        onManagerChange={onManagerChange}
        usageHtml={usageHtml}
        usage={usage}
        codeHtml={codeHtml}
        code={code}
        slug={slug}
      />

      <section>
        <h2 className="docs-h2">Usage</h2>
        <DocsCodeBlock html={usageHtml} code={usage} title="app/page.tsx" />
      </section>

      {extra.map((section) => (
        <section key={section.title}>
          <h2 className="docs-h2">{section.title}</h2>
          <div className="docs-prose" dangerouslySetInnerHTML={{ __html: section.html }} />
        </section>
      ))}
    </div>
  );
}
