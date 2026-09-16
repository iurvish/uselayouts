"use client";

import { StackEngine } from "./stack";
import type { StackCard } from "./cards";

function Face({ card }: { card: StackCard }) {
  return (
    <article
      className="grid h-auto w-full grid-cols-1 overflow-hidden rounded-[28px] p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] md:h-[500px] md:grid-cols-[minmax(0,1fr)_400px] md:gap-8 md:p-4"
      style={{ backgroundColor: card.paper, color: card.ink }}
    >
      <div className="flex min-w-0 flex-col justify-between gap-6 px-3 py-5 md:px-6 md:py-8">
        <p className="m-0 font-mono text-sm font-medium tabular-nums tracking-[0.08em] opacity-55">
          {card.index}
        </p>
        <div className="flex flex-col gap-3">
          <p className="m-0 text-[11px] font-medium uppercase tracking-[0.16em] opacity-60">
            {card.category}
          </p>
          <h2 className="m-0 max-w-[18ch] text-[clamp(1.4rem,2.4vw,2.35rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-balance">
            {card.title}
          </h2>
          <p className="m-0 max-w-[42ch] text-[0.98rem] leading-relaxed text-pretty opacity-75">
            {card.description}
          </p>
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl outline outline-1 outline-black/10 md:aspect-auto md:h-full">
        <img
          src={card.image}
          alt=""
          width={800}
          height={600}
          draggable={false}
          className="pointer-events-none absolute inset-0 block size-full object-cover"
        />
      </div>
    </article>
  );
}

export function Paper() {
  return (
    <StackEngine
      canvasClassName="bg-[oklch(0.97_0.008_85)] font-sans text-[oklch(0.28_0.03_75)] antialiased"
      renderCard={(card) => <Face card={card} />}
    />
  );
}
