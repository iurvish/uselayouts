"use client";

import { StackEngine } from "./stack";
import type { StackCard } from "./cards";

function Face({ card }: { card: StackCard }) {
  return (
    <article className="relative h-auto min-h-[22rem] w-full overflow-hidden rounded-[24px] text-white md:h-[500px]">
      <img
        src={card.image}
        alt=""
        width={1600}
        height={1000}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_28%,oklch(0.16_0.02_260_/_0.88)_100%)]"
      />
      <div className="relative flex h-full min-h-[22rem] flex-col justify-end gap-3 p-6 md:min-h-0 md:p-10">
        <p className="m-0 font-mono text-sm font-medium tabular-nums tracking-[0.14em] text-white/70">
          {card.index} · {card.category}
        </p>
          <h2 className="m-0 max-w-[22ch] text-[clamp(1.5rem,3vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance">
          {card.title}
        </h2>
      </div>
    </article>
  );
}

export function Film() {
  return (
    <StackEngine
      canvasClassName="bg-[oklch(0.16_0.015_260)] font-sans text-white antialiased"
      renderCard={(card) => <Face card={card} />}
    />
  );
}
