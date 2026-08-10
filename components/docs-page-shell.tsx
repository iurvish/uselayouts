"use client";

import * as React from "react";
import { DialPreviewProvider } from "@/components/dial-preview-context";
import { DocsDialSidebar } from "@/components/docs-dial-sidebar";
import { MorphToc } from "@/components/mdx/morph-toc";

type TocItem = {
  title?: React.ReactNode;
  url: string;
  depth: number;
};

export function DocsPageShell({
  children,
  showDial,
  toc,
}: {
  children: React.ReactNode;
  showDial?: boolean;
  toc?: TocItem[];
}) {
  return (
    <DialPreviewProvider>
      <div className="relative flex w-full min-w-0 flex-1 overflow-x-clip">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip overflow-y-auto px-4 py-12 pb-32 sm:mt-0">
          {children}
        </div>
        {showDial ? <DocsDialSidebar /> : null}
        {toc?.length ? <MorphToc toc={toc} /> : null}
      </div>
    </DialPreviewProvider>
  );
}
