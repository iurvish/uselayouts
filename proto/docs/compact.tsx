"use client";

import {
  DOC_TOC,
  DocsContent,
  DocsProtoNav,
  StickyAirplaneToc,
} from "./shared";

export function CompactDocs() {
  return (
    <div className="min-h-svh bg-muted/30 text-foreground">
      <DocsProtoNav className="border-border bg-background" />

      <div className="mx-auto flex max-w-[960px] gap-6 px-4 py-6 sm:px-6 lg:gap-8">
        <StickyAirplaneToc
          toc={DOC_TOC}
          top="4.5rem"
          className="w-[200px]"
        />

        <main className="min-w-0 flex-1 rounded-xl border border-border/70 bg-background px-5 py-6 shadow-sm sm:px-7 sm:py-8 pb-24">
          <DocsContent sectionStyle="compact" />
        </main>
      </div>
    </div>
  );
}
