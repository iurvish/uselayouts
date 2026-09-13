"use client";

import {
  DOC_TOC,
  DocsContent,
  DocsProtoNav,
  StickyAirplaneToc,
} from "./shared";

export function SplitDocs() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <DocsProtoNav />

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-0 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:gap-10 lg:px-8 lg:py-12">
        <StickyAirplaneToc toc={DOC_TOC} top="5.5rem" />

        <main className="min-w-0 max-w-prose pb-24 lg:mx-auto">
          <DocsContent sectionStyle="default" />
        </main>

        <aside
          className="hidden self-start lg:block"
          style={{ position: "sticky", top: "5.5rem" }}
        >
          <div className="space-y-6 text-[13px]">
            <div>
              <p className="mb-2 font-medium text-foreground">On this page</p>
              <p className="text-muted-foreground">
                Installation guide for the uselayouts shadcn registry.
              </p>
            </div>

            <div className="border-t border-border/60 pt-5">
              <p className="mb-2 font-medium text-foreground">Quick copy</p>
              <pre className="overflow-x-auto rounded-md border border-border/70 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-foreground/85">
                npx shadcn@latest add @uselayouts/discrete-tabs
              </pre>
            </div>

            <div className="border-t border-border/60 pt-5">
              <p className="mb-2 font-medium text-foreground">Related</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="/docs/components/pricing-card" className="hover:text-foreground">
                    Component gallery
                  </a>
                </li>
                <li>
                  <a href="/browse" className="hover:text-foreground">
                    Browse all layouts
                  </a>
                </li>
              </ul>
            </div>

            <div className="border-t border-border/60 pt-5 text-muted-foreground">
              <p className="font-medium text-foreground">Updated</p>
              <p className="mt-1">March 2026</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
