"use client";

import * as React from "react";

import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { InstallGuide } from "@/components/open/install-guide";
import { SlidingTabs } from "@/components/open/sliding-tabs";
import type { PackageManager } from "@/lib/open/package-manager";

export function OpenCodePanel({
  description,
  docs,
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
  docs?: { title: string; html: string }[];
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
  const extra = (docs ?? []).filter((section) => !/^usage$/i.test(section.title));

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

      {extra.map((section) => (
        <section key={section.title}>
          <h2 className="mt-7 mb-3.5 text-2xl font-semibold tracking-tight text-foreground text-balance">
            {section.title}
          </h2>
          <div
            className="text-sm leading-relaxed text-muted-foreground [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:grid [&_ul]:gap-2 [&_ul]:pl-[18px] [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-[0.12em] [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-foreground"
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        </section>
      ))}
    </div>
  );
}
