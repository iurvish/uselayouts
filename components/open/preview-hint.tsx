import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function HintConnector({ tone }: { tone: "dark" | "light" }) {
  return (
    <div className="flex h-14 w-2 shrink-0 flex-col items-center" aria-hidden>
      <div
        className={cn(
          "size-2 shrink-0 rounded-[2px] border",
          tone === "light" ? "border-neutral-400/70" : "border-white/35",
        )}
      />
      <div
        className={cn(
          "w-px flex-1 bg-linear-to-b to-transparent",
          tone === "light" ? "from-neutral-400/70" : "from-white/35",
        )}
      />
    </div>
  );
}

export function PreviewHint({
  heading,
  description,
  children,
  className,
  tone = "dark",
}: {
  heading: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "grid h-full w-full min-w-0 grid-rows-[auto_1fr] justify-items-center",
        className,
      )}
    >
      <div className="flex max-w-full flex-col items-center gap-8 px-4 pt-20">
        <div className="flex max-w-full flex-col items-center gap-1 text-center">
          <p
            className={cn(
              "text-balance font-[family-name:var(--font-geist-sans)] text-lg tracking-[-0.03em]",
              tone === "light" ? "text-neutral-900" : "text-white",
            )}
          >
            {heading}
          </p>
          {description ? (
            <p
              className={cn(
                "max-w-prose font-[family-name:var(--font-geist-sans)] text-sm tracking-[-0.03em] text-pretty",
                tone === "light" ? "text-neutral-500" : "text-muted-foreground",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        <HintConnector tone={tone} />
      </div>
      <div className="flex min-h-0 w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
