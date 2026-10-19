"use client";

import { REACH_PERIOD, REACH_STATS } from "@/lib/sponsor/reach";
import { cn } from "@/lib/utils";

/** The traffic a slot actually buys, sat directly above the pricing so the
 *  numbers and the cost read as one argument. Every figure here is a reason
 *  to sponsor — no deltas, no metric that reads as a warning. */
export function SponsorReach() {
  return (
    <section
      /* shrink-0: the tiers column is a max-height flex scroller, which would
         otherwise compress this card and clip the numbers. */
      /* pb matches px so the grid sits evenly inside the card — unlike the
         tier sections, nothing follows it to fill a deeper bottom gutter. */
      className="flex w-full min-w-0 shrink-0 flex-col gap-2.5 overflow-hidden rounded-[10px] border border-[#f0f0f0] bg-[#fdfdfc] px-1 pt-[7px] pb-1"
      aria-label={`useLayouts reach, ${REACH_PERIOD.toLowerCase()}`}
    >
      <div className="flex w-full items-center justify-between gap-3 px-[5px]">
        <p className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.08em] text-[#071A31]/55 uppercase">
          useLayouts reach
        </p>
        <p className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.04em] text-[#071A31]/50">
          {REACH_PERIOD}
        </p>
      </div>

      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-[10px] border border-[#f0f0f0] bg-[#f9f8f5] sm:grid-cols-3",
          "shadow-[0px_6px_16px_-10px_rgba(0,0,0,0.04),0px_4px_6px_-10px_rgba(0,0,0,0.26),0px_2px_4px_-10px_rgba(0,0,0,0.08)]",
        )}
      >
        {REACH_STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "flex min-w-0 flex-col px-4 py-4",
              /* Hairlines stack horizontally on mobile, vertically from sm up. */
              i > 0 && "border-t border-[#ececec] sm:border-t-0 sm:border-l",
            )}
          >
            <p className="truncate text-[13px] leading-none text-[#071A31]/55">
              {stat.label}
            </p>
            <p className="mt-3 text-[30px] leading-none font-bold tracking-[-0.035em] text-[#071A31] tabular-nums">
              {stat.value}
            </p>
            <p className="mt-2.5 text-[12px] leading-[1.35] text-[#071A31]/45">
              {stat.hint}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
