"use client";

import { DialRoot } from "dialkit";
import { TIERS, TierTickets, TiersShell, HeroCard } from "./tiers-shared";
import type { RibbonPatternMode } from "./ribbon-pattern";
import { cn } from "@/lib/utils";

export function TiersClassic({
  pattern = "cylinder",
  dial = false,
  dialPanel = "Ribbon pattern",
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
        <HeroCard
          pattern={pattern}
          dial={dial}
          dialPanel={dialPanel}
          className="w-full max-w-[454px] lg:h-[584px]"
        />
        <div className="flex w-full min-w-0 flex-1 flex-col gap-5 p-4 lg:max-h-[760px] lg:overflow-y-auto">
          {TIERS.map((tier) => (
            <TierTickets key={tier} label={tier} />
          ))}
        </div>
      </main>
    </TiersShell>
  );
}
