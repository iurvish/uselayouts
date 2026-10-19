"use client";

import { DialRoot } from "dialkit";
import { TIERS, TierTickets, TiersShell } from "./tiers-shared";
import { HeroFolder } from "./hero-folder";
import { SponsorReach } from "./sponsor-reach";
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
      {dial ? (
        <DialRoot
          productionEnabled
          position="top-right"
          defaultOpen
          theme="dark"
        />
      ) : null}
      <main
        className={cn(
          "mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center gap-10 px-4 py-6",
          "lg:flex-row lg:items-center lg:justify-center lg:gap-14 lg:px-8 lg:py-2.5",
        )}
      >
        <div className="relative z-[999] flex w-full max-w-[400px] shrink-0 justify-center">
          <HeroFolder pattern={pattern} />
        </div>
        {/* No height cap or inner scroller: the reach card made the column
            taller than the old 760px, which clipped the Bronze tier. The page
            scrolls instead. */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4 p-3 lg:max-w-[800px] lg:gap-5 lg:p-4">
          <SponsorReach />
          {TIERS.map((tier) => (
            <TierTickets key={tier} label={tier} />
          ))}
        </div>
      </main>
    </TiersShell>
  );
}
