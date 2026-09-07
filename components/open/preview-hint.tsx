import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function HintConnector() {
  return (
    <div className="flex h-14 w-2 shrink-0 flex-col items-center" aria-hidden>
      <div className="size-2 shrink-0 rounded-[2px] border border-white/35" />
      <div className="w-px flex-1 bg-linear-to-b from-white/35 to-transparent" />
    </div>
  );
}

export function PreviewHint({
  heading,
  description,
  children,
  className,
}: {
  heading: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col items-center", className)}>
      <div className="flex max-w-full flex-col items-center gap-[18px] px-4">
        <div className="flex max-w-full flex-col items-center gap-2 text-center">
          <p className="text-balance font-[family-name:var(--font-geist-sans)] text-base tracking-[-0.03em] text-white">
            {heading}
          </p>
          {description ? (
            <p className="max-w-prose font-[family-name:var(--font-geist-sans)] text-sm tracking-[-0.03em] text-pretty text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <HintConnector />
      </div>
      {children}
    </div>
  );
}
