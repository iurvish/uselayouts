"use client";

import { DialRoot } from "dialkit";
import { cn } from "@/lib/utils";

export function DocsDialSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "sticky top-14 z-30 hidden h-[calc(100dvh-3.5rem)] w-[312px] shrink-0 p-3 xl:block",
        className,
      )}
    >
      <div
        className={cn(
          "dialkit-inline-host flex h-full flex-col overflow-hidden rounded-lg border border-border bg-[#212121] shadow-sm",
        )}
      >
        <div className="shrink-0 border-b border-white/10 px-3 py-2.5">
          <p className="text-xs font-medium tracking-wide text-white/80">
            Control Panel
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <DialRoot
            mode="inline"
            productionEnabled
            defaultOpen
            theme="dark"
          />
        </div>
      </div>
    </aside>
  );
}
