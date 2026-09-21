import type { ReactNode } from "react";
import {
  StickyAirplaneToc,
  type DocTocItem,
} from "@/components/docs/sticky-airplane-toc";

export function DocsPageShell({
  children,
  toc,
}: {
  children: ReactNode;
  toc?: DocTocItem[];
}) {
  const hasToc = Boolean(toc?.length);

  return (
    <div
      id="nd-docs-layout"
      className="mx-auto flex w-full justify-center gap-8 px-4 py-8 sm:px-8 sm:py-12"
    >
      {/* Narrow reading column; article + TOC center as one unit */}
      <main className="min-w-0 w-full max-w-xl pb-24 xl:w-[36rem] xl:flex-none">
        {children}
      </main>

      {hasToc ? <StickyAirplaneToc toc={toc!} /> : null}
    </div>
  );
}
