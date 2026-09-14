"use client";

import { DialRoot } from "dialkit";
import { TIERS, TierTickets, TiersShell } from "./tiers-shared";
import { HeroFolder } from "./hero-folder";
import type { RibbonPatternMode } from "./ribbon-pattern";
import { cn } from "@/lib/utils";

export function TiersClassic({
  pattern = "cylinder",
  dial = false,
}: {
  pattern?: RibbonPatternMode;
  dial?: boolean;
  dialPanel?: string;
}) {
  return (
    <TiersShell>
      {dial ? <DialRoot productionEnabled position="top-right" defaultOpen /> : null}
      <main
        className={cn(
          "mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center gap-10 px-4 py-6",
          "lg:flex-row lg:items-center lg:gap-[100px] lg:pl-[100px] lg:pr-4 lg:py-2.5",
        )}
      >
        <div className="relative z-[999] flex w-full max-w-[454px] shrink-0 justify-center lg:justify-start">
          <HeroFolder pattern={pattern} />
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-5 p-4 lg:max-h-[760px] lg:overflow-y-auto">
          {TIERS.map((tier) => (
            <TierTickets key={tier} label={tier} />
          ))}
        </div>
      </main>
    </TiersShell>
  );
}
