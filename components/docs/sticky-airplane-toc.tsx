"use client";

import { DocsTableOfContents } from "@/components/mdx/table-of-content";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type DocTocItem = {
  title?: ReactNode;
  url: string;
  depth: number;
};

/**
 * Absolute to the right of the article.
 * Article is max-w-2xl (42rem), nudged left 1.5rem (−translate-x-6).
 * left = 50% − 1.5rem + 21rem + 6rem gap
 */
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
      className={cn(
        "pointer-events-none absolute inset-y-0 left-[calc(50%+25.5rem)] hidden w-72 overflow-visible xl:block",
        className,
      )}
    >
      <div className="pointer-events-auto sticky overflow-visible" style={{ top }}>
        <DocsTableOfContents
          toc={toc}
          className="overflow-visible px-0 pt-0 [&_a]:text-[#4B565E]/75 [&_a[data-active=true]]:text-[#071A31] [&_a:hover]:text-[#071A31] [&_p]:bg-[#F5F3EE] [&_p]:text-[#4B565E]/75"
          indicatorClassName="text-[#4B565E]"
          indicatorActivePathColor="#071A31"
          indicatorAirplaneFill="#071A31"
        />
      </div>
    </aside>
  );
}
