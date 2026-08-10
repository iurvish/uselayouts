"use client";

import { DialRoot } from "dialkit";
import { cn } from "@/lib/utils";
import { useDialPreview } from "@/components/dial-preview-context";

export function DocsDialSidebar({ className }: { className?: string }) {
  const { active } = useDialPreview();

  return (
    <aside
      className={cn(
        "sticky top-14 z-30 hidden h-[calc(100dvh-3.5rem)] w-[312px] shrink-0 grow-0 basis-[312px] self-start p-3 xl:block",
        className,
      )}
    >
      <div className="dialkit-inline-host flex h-full flex-col overflow-hidden rounded-lg border border-border bg-[#212121] shadow-sm">
        <div className="shrink-0 border-b border-white/10 px-3 py-2.5">
          <p className="text-xs font-medium tracking-wide text-white/80">
            Control Panel
          </p>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {active ? (
            <DialRoot
              mode="inline"
              productionEnabled
              defaultOpen
              theme="dark"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center">
              <p className="text-xs leading-relaxed text-white/45">
                Switch to the Preview tab to customize this component.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
