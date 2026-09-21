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
      className="relative mx-auto w-full px-4 py-8 sm:px-8 sm:py-12"
    >
      {/* Centered, nudged slightly left; a bit wider than max-w-xl */}
      <main className="mx-auto min-w-0 w-full max-w-2xl pb-24 xl:-translate-x-6">
        {children}
      </main>

      {hasToc ? <StickyAirplaneToc toc={toc!} /> : null}
    </div>
  );
}
