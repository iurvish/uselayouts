"use client";

import { StackEngine } from "./stack";
import type { StackCard } from "./cards";

function Face({ card }: { card: StackCard }) {
  return (
    <article
      className="grid h-auto w-full grid-cols-1 gap-3 overflow-hidden rounded-[24px] p-[10px] text-white md:h-[500px] md:grid-cols-[1fr_408px] md:gap-0 md:py-[10px] md:pl-9 md:pr-[10px]"
      style={{ backgroundColor: card.fill }}
    >
      <div className="flex min-w-0 flex-col gap-4 px-2 pb-2 pt-4 md:gap-6 md:px-0 md:pb-0 md:pr-12 md:pt-9">
        <p className="m-0 font-mono text-xl font-semibold uppercase leading-none tabular-nums md:text-[2rem]">
          {card.index}
        </p>
        <div className="flex flex-col gap-2 md:gap-3">
          <p className="m-0 text-xs font-semibold uppercase leading-5 tracking-[0.14em] opacity-75 md:text-base">
            {card.category}
          </p>
          <h2 className="m-0 text-[clamp(1.35rem,2.8vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.03em] text-balance">
            {card.title}
          </h2>
        </div>
        <p className="m-0 max-w-[42ch] text-[clamp(0.95rem,1.2vw,1.18rem)] leading-normal text-pretty">
          {card.description}
        </p>
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] outline outline-1 outline-white/10 md:aspect-auto md:h-full md:w-[408px] md:shrink-0">
        <img
          src={card.image}
          alt=""
          width={816}
          height={600}
          draggable={false}
          className="pointer-events-none absolute inset-0 block size-full object-cover"
        />
      </div>
    </article>
  );
}

export function Saturated() {
  return (
    <StackEngine
      canvasClassName="bg-[#f7f7f7] font-sans text-[rgb(46,46,46)] antialiased"
      renderCard={(card) => <Face card={card} />}
    />
  );
}
