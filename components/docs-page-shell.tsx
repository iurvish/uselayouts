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
      className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-0 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-12"
    >
      {hasToc ? <StickyAirplaneToc toc={toc!} /> : <div className="hidden lg:block" />}

      <main className="min-w-0 max-w-prose pb-24 lg:mx-auto">{children}</main>
    </div>
  );
}
