"use client";

import { DocsTableOfContents } from "@/components/mdx/table-of-content";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type DocTocItem = {
  title?: ReactNode;
  url: string;
  depth: number;
};

/** Sticky right rail beside the article — hidden below xl. */
export function StickyAirplaneToc({
  toc,
  className,
  top = "6rem",
}: {
  toc: DocTocItem[];
  className?: string;
  top?: string;
}) {
  if (!toc.length) return null;

  return (
    <aside
      className={cn("hidden w-64 shrink-0 self-start xl:block", className)}
      style={{ position: "sticky", top }}
    >
      <DocsTableOfContents
        toc={toc}
        className="px-0 pt-0 [&_a]:text-[#4B565E]/75 [&_a[data-active=true]]:text-[#071A31] [&_a:hover]:text-[#071A31] [&_p]:bg-[#F5F3EE] [&_p]:text-[#4B565E]/75"
        indicatorClassName="text-[#4B565E]"
        indicatorActivePathColor="#071A31"
        indicatorAirplaneFill="#071A31"
      />
    </aside>
  );
}
