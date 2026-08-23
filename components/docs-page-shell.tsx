import type { ReactNode } from "react";
import { MorphToc } from "@/components/mdx/morph-toc";

type TocItem = {
  title?: ReactNode;
  url: string;
  depth: number;
};

export function DocsPageShell({
  children,
  toc,
}: {
  children: ReactNode;
  toc?: TocItem[];
}) {
  return (
    <div className="relative flex w-full min-w-0 flex-1 overflow-x-clip">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip overflow-y-auto px-4 py-12 pb-32 sm:mt-0">
        {children}
      </div>
      {toc?.length ? <MorphToc toc={toc} /> : null}
    </div>
  );
}
