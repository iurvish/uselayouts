"use client";

import * as React from "react";
import { SPONSOR_HREF } from "./shared";

export { SPONSOR_HREF };
import {
  RibbonField,
  RibbonFieldDial,
  type RibbonPatternMode,
} from "./ribbon-pattern";
import { cn } from "@/lib/utils";
import { startSponsorCheckout } from "@/lib/sponsor/checkout";
import { SPONSOR_PLANS, type SponsorTier } from "@/lib/sponsor/plans";
import { TIER_SPONSORS, type SponsorEntry } from "@/lib/sponsor/sponsors";
import { SPONSOR_LOGOS } from "./sponsor-logos";

export { TIER_SPONSORS };
export type { SponsorEntry };
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const TIERS = ["Gold", "Silver", "Bronze"] as const;

const TIER_KEY: Record<(typeof TIERS)[number], SponsorTier> = {
  Gold: "gold",
  Silver: "silver",
  Bronze: "bronze",
};

export type SponsorLogoMode = "marks" | "names" | "mixed" | "chips" | "rows";

export const SLOT_SHAPES = [
  { src: "/sponsor/figma/slot-a.png", w: 242, h: 124 },
  { src: "/sponsor/figma/slot-b.png", w: 242, h: 124 },
  { src: "/sponsor/figma/slot-c.png", w: 242, h: 124 },
] as const;

export const HERO_COPY = {
  title: "useLayouts stays free because people like you keep the lights on",
  body: "This library needs you. Be the backbone that keeps this library standing strong. Help us keep it free for everyone",
} as const;

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M9 3.25V14.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.25 9H14.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SponsorMark({
  sponsor,
  size = "md",
}: {
  sponsor: SponsorEntry;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "size-8 text-[11px]",
    md: "size-11 text-[13px]",
    lg: "size-14 text-[15px]",
  };
  const Logo = sponsor.logo ? SPONSOR_LOGOS[sponsor.logo] : null;

  /** A real mark is already its own shape, so it gets the footprint without
   *  the tile — a logo boxed inside another rounded square reads as a sticker. */
  if (Logo) {
    return (
      <span
        className={cn("flex shrink-0 items-center justify-center", sizes[size])}
        style={{ color: sponsor.color }}
      >
        <Logo className="size-full" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[10px] font-semibold tracking-[-0.02em] text-white",
        sizes[size],
      )}
      style={{ backgroundColor: sponsor.color }}
      aria-hidden
    >
      {sponsor.abbr}
    </span>
  );
}

function EmptySlotCta() {
  return (
    <span
      className={cn(
        "flex h-9 w-11 items-center justify-center rounded-xl border border-[rgba(75,86,94,0.35)] bg-transparent text-[#767D84]",
        "transition-[color,background-color,border-color,transform] duration-150 ease-out",
        "group-hover:border-[#071A31]/30 group-hover:bg-[#071A31]/06 group-hover:text-[#071A31]",
        "group-hover:scale-[1.04] group-active:scale-[0.98]",
      )}
      aria-hidden
    >
      <PlusIcon className="transition-transform duration-150 ease-out group-hover:rotate-90" />
    </span>
  );
}

function useSponsorCheckout(tier: SponsorTier) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onClick = React.useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      await startSponsorCheckout(tier);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setPending(false);
    }
  }, [tier]);

  return { pending, error, onClick };
}

function TicketSlotContent({
  sponsor,
  mode,
}: {
  sponsor: SponsorEntry | null;
  mode: SponsorLogoMode;
}) {
  if (!sponsor) return <EmptySlotCta />;
  if (mode === "marks") return <SponsorMark sponsor={sponsor} />;
  if (mode === "names") {
    return (
      <p
        className="max-w-[88%] truncate text-center text-[13px] font-medium leading-tight tracking-[-0.02em] text-[#071A31]"
        title={sponsor.name}
      >
        {sponsor.name}
      </p>
    );
  }
  return (
    <div className="flex max-w-[90%] flex-col items-center gap-1.5">
      <SponsorMark sponsor={sponsor} />
      <p
        className="w-full truncate text-center text-[11px] font-medium leading-tight tracking-[-0.01em] text-[#071A31]/75"
        title={sponsor.name}
      >
        {sponsor.name}
      </p>
    </div>
  );
}

export function SponsorTicketSlot({
  sponsor,
  shape,
  tier,
  mode = "marks",
}: {
  sponsor: SponsorEntry | null;
  shape: (typeof SLOT_SHAPES)[number];
  tier: SponsorTier;
  mode?: SponsorLogoMode;
}) {
  const checkout = useSponsorCheckout(tier);
  const plan = SPONSOR_PLANS[tier];
  const label = sponsor
    ? `Visit ${sponsor.name} sponsor page`
    : `Become a ${plan.label} sponsor, $${plan.priceUsd}/mo`;

  if (!sponsor) {
    return (
      <div className="relative min-w-0 w-full">
        <Tooltip>
          <TooltipTrigger
            type="button"
            onClick={() => void checkout.onClick()}
            disabled={checkout.pending}
            className="group relative block w-full min-w-0 cursor-pointer transition-opacity duration-150 hover:opacity-90 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
            aria-label={label}
          >
            <TicketFace sponsor={null} shape={shape} mode={mode} />
          </TooltipTrigger>
          <TooltipContent side="top">Sponsor me 💛</TooltipContent>
        </Tooltip>
        {checkout.error ? (
          <p className="mt-1 text-center text-[11px] text-red-700" role="alert">
            {checkout.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className="group relative block min-w-0 w-full transition-opacity duration-150 hover:opacity-90 active:scale-[0.99]"
      aria-label={label}
    >
      <TicketFace sponsor={sponsor} shape={shape} mode={mode} />
    </a>
  );
}

function TicketFace({
  sponsor,
  shape,
  mode,
}: {
  sponsor: SponsorEntry | null;
  shape: (typeof SLOT_SHAPES)[number];
  mode: SponsorLogoMode;
}) {
  return (
    <div className="relative mx-auto aspect-[242/124] w-full max-w-[242px] min-w-0 overflow-hidden [&_img]:pointer-events-none">
      <div
        aria-hidden
        className="absolute inset-0 bg-[#FDFCFC]"
        style={{
          maskImage: `url(${shape.src})`,
          WebkitMaskImage: `url(${shape.src})`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shape.src}
        alt=""
        width={shape.w}
        height={shape.h}
        className="absolute inset-0 size-full object-contain object-center"
        draggable={false}
      />
      <span className="absolute inset-0 flex items-center justify-center px-3">
        <TicketSlotContent sponsor={sponsor} mode={mode} />
      </span>
    </div>
  );
}

export function SponsorChip({
  sponsor,
  tier,
}: {
  sponsor: SponsorEntry | null;
  tier: SponsorTier;
}) {
  const checkout = useSponsorCheckout(tier);
  if (!sponsor) {
    return (
      <button
        type="button"
        onClick={() => void checkout.onClick()}
        disabled={checkout.pending}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-dashed border-[#071A31]/20 bg-white/60 px-4 text-[13px] font-medium text-[#071A31]/55 transition-[background-color,border-color] duration-150 hover:border-[#071A31]/35 hover:bg-white active:scale-[0.99] disabled:opacity-60"
        aria-label={`Become a ${SPONSOR_PLANS[tier].label} sponsor`}
      >
        <PlusIcon />
        {checkout.pending ? "Opening…" : `$${SPONSOR_PLANS[tier].priceUsd}/mo`}
      </button>
    );
  }
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 shrink-0 max-w-[220px] items-center gap-2.5 rounded-full border border-[#e2e2e2] bg-white px-3 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02)] transition-[transform,box-shadow] duration-150 hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)] active:scale-[0.99]"
      aria-label={`Visit ${sponsor.name}`}
      title={sponsor.name}
    >
      <SponsorMark sponsor={sponsor} size="sm" />
      <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-[#071A31]">
        {sponsor.name}
      </span>
    </a>
  );
}

export function SponsorGridCard({
  sponsor,
  tier,
}: {
  sponsor: SponsorEntry | null;
  tier: SponsorTier;
}) {
  const checkout = useSponsorCheckout(tier);
  if (!sponsor) {
    return (
      <button
        type="button"
        onClick={() => void checkout.onClick()}
        disabled={checkout.pending}
        className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#071A31]/18 bg-[#f9f8f5] text-[#071A31]/50 transition-[border-color,background-color] duration-150 hover:border-[#071A31]/30 hover:bg-white active:scale-[0.99] disabled:opacity-60"
        aria-label={`Become a ${SPONSOR_PLANS[tier].label} sponsor`}
      >
        <PlusIcon />
        <span className="text-[12px] font-medium">
          {checkout.pending
            ? "Opening…"
            : `$${SPONSOR_PLANS[tier].priceUsd}/mo`}
        </span>
      </button>
    );
  }
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-[14px] border border-[#e2e2e2] bg-white p-4 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02)] transition-[transform,box-shadow] duration-150 hover:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)] active:scale-[0.99]"
      aria-label={`Visit ${sponsor.name}`}
      title={sponsor.name}
    >
      <SponsorMark sponsor={sponsor} size="lg" />
      <p className="w-full truncate text-center text-[12px] font-medium tracking-[-0.01em] text-[#071A31]/80">
        {sponsor.name}
      </p>
    </a>
  );
}

export function SponsorRow({
  sponsor,
  tier,
}: {
  sponsor: SponsorEntry;
  tier: string;
}) {
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-[#e2e2e2] bg-white px-4 py-3 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02)] transition-[transform,box-shadow] duration-150 hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)] active:scale-[0.99]"
      aria-label={`Visit ${sponsor.name}`}
    >
      <SponsorMark sponsor={sponsor} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium tracking-[-0.01em] text-[#071A31]">
          {sponsor.name}
        </p>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-[#071A31]/45 uppercase">
          {tier} · since {sponsor.since ?? "2025"}
        </p>
      </div>
    </a>
  );
}

const TIER_CHIP: Record<
  SponsorTier,
  { fill: string; border: string; insetWash: string; text: string }
> = {
  gold: {
    fill: "linear-gradient(180deg, #FFE9A0 0%, #F5D15A 38%, #E8B82E 72%, #D4A017 100%)",
    border: "rgba(196, 146, 20, 0.55)",
    insetWash: "#FFF3C4",
    text: "#6B4E08",
  },
  silver: {
    fill: "linear-gradient(180deg, #FFFFFF 0%, #F0F2F5 40%, #D8DEE6 78%, #C5CDD8 100%)",
    border: "rgba(140, 150, 165, 0.45)",
    insetWash: "#FFFFFF",
    text: "#3D4654",
  },
  bronze: {
    fill: "linear-gradient(180deg, #FFD2A8 0%, #F0A86A 40%, #E08540 75%, #C96A28 100%)",
    border: "rgba(180, 95, 40, 0.5)",
    insetWash: "#FFE0C0",
    text: "#6B3210",
  },
};

export function TierMetalChip({
  tier,
  label,
}: {
  tier: SponsorTier;
  label: string;
}) {
  const chip = TIER_CHIP[tier];
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full px-3.5 py-[6px]"
      style={{ background: chip.fill }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: `
            0px 1.08px 2px 0px rgba(33, 33, 33, 0.45),
            0px 3.25px 5px 0px rgba(0, 0, 0, 0.1),
            inset 0px 1.8px 1.4px 0px rgba(255, 255, 255, 1),
            inset 0px -6.6px 0px -5.42px rgba(255, 255, 255, 0.92),
            inset 0px -3.25px 5px 0px rgba(0, 0, 0, 0.14),
            inset 0px -7.59px 1px -5.42px ${chip.insetWash},
            inset 2.8px 3.6px 0px 0px rgba(255, 255, 255, 0.35),
            inset -1.5px -2px 3px 0px rgba(0, 0, 0, 0.06)
          `,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border border-solid"
        style={{ borderColor: chip.border }}
      />
      <span
        className="relative text-[13px] font-medium leading-[15.6px] tracking-[-0.65px]"
        style={{
          color: chip.text,
          textShadow: "0px 1px 0px rgba(255, 255, 255, 0.45)",
        }}
      >
        {label}
      </span>
    </span>
  );
}

export function BenefitsLine({ benefits }: { benefits: readonly string[] }) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
  } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [overflowing, setOverflowing] = React.useState(false);
  const [edges, setEdges] = React.useState({ left: false, right: false });

  const updateEdges = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const canScroll = max > 2;
    const left = canScroll && el.scrollLeft > 2;
    const right = canScroll && el.scrollLeft < max - 2;
    setOverflowing(canScroll);
    setEdges((prev) =>
      prev.left === left && prev.right === right ? prev : { left, right },
    );
  }, []);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    el.addEventListener("scroll", updateEdges, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateEdges);
    };
  }, [benefits, updateEdges]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const scroller = scrollerRef.current;
    if (!scroller || scroller.scrollWidth - scroller.clientWidth <= 2) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: scroller.scrollLeft,
    };
    setDragging(true);
    scroller.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const scroller = scrollerRef.current;
    if (!drag || !scroller || drag.pointerId !== e.pointerId) return;
    scroller.scrollLeft = drag.startScroll - (e.clientX - drag.startX);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      scrollerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  return (
    <div className="relative w-full min-w-0">
      <div
        ref={scrollerRef}
        className={cn(
          "flex w-full min-w-0 touch-pan-x select-none items-center gap-x-2.5 overflow-x-auto overflow-y-hidden px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          overflowing ? "cursor-grab" : "cursor-default",
          overflowing && dragging && "cursor-grabbing",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        {benefits.map((benefit, i) => (
          <React.Fragment key={benefit}>
            {i > 0 ? (
              <span
                className="size-1 shrink-0 rounded-full bg-[#071A31]/25"
                aria-hidden
              />
            ) : null}
            <span className="shrink-0 whitespace-nowrap text-[15px] leading-[1.2] tracking-[-0.5px] text-black sm:text-[16px] sm:tracking-[-0.55px]">
              {benefit}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-[#fdfdfc] to-transparent transition-opacity duration-150",
          edges.left ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-[#fdfdfc] to-transparent transition-opacity duration-150",
          edges.right ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export function TierTickets({
  label,
}: {
  label: (typeof TIERS)[number];
  compact?: boolean;
}) {
  const tier = TIER_KEY[label];
  const sponsors = TIER_SPONSORS[tier];
  const plan = SPONSOR_PLANS[tier];
  return (
    <section
      className="flex w-full min-w-0 flex-col items-center gap-2.5 overflow-hidden rounded-[10px] border border-[#f0f0f0] bg-[#fdfdfc] px-1 pb-2.5 pt-[7px]"
      aria-label={`${label} sponsors`}
    >
      <div className="flex w-full items-center justify-between gap-3 px-[5px]">
        <TierMetalChip tier={tier} label={label} />
        <p className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.04em] text-[#071A31]/50 tabular-nums">
          ${plan.priceUsd}/mo
        </p>
      </div>

      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 items-center justify-items-center gap-2.5 overflow-hidden rounded-[10px] border border-[#f0f0f0] bg-[#f9f8f5] px-3 py-3.5 sm:grid-cols-3 sm:gap-3 sm:px-3.5 sm:py-4",
          "shadow-[0px_6px_16px_-10px_rgba(0,0,0,0.04),0px_4px_6px_-10px_rgba(0,0,0,0.26),0px_2px_4px_-10px_rgba(0,0,0,0.08)]",
        )}
      >
        {SLOT_SHAPES.map((shape, i) => (
          <SponsorTicketSlot
            key={`${label}-${shape.src}`}
            sponsor={sponsors[i] ?? null}
            shape={shape}
            tier={tier}
          />
        ))}
      </div>

      <div className="w-full min-w-0 px-[5px]">
        <BenefitsLine benefits={plan.benefits} />
      </div>
    </section>
  );
}

export function TierChips({ label }: { label: (typeof TIERS)[number] }) {
  const sponsors = TIER_SPONSORS[TIER_KEY[label]];
  const slots = [
    ...sponsors,
    ...Array(Math.max(0, 3 - sponsors.length)).fill(null),
  ].slice(0, 3);
  return (
    <section className="rounded-[14px] border border-[#e2e2e2] bg-[#f9f8f5] p-4 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02)]">
      <h2 className="text-[18px] leading-[1.15] tracking-[-0.72px] text-black">
        {label}
      </h2>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slots.map((s, i) => (
          <SponsorChip
            key={`${label}-${i}`}
            sponsor={s}
            tier={TIER_KEY[label]}
          />
        ))}
      </div>
    </section>
  );
}

export function HeroCard({
  pattern,
  className,
  artClassName,
  dial = false,
  dialPanel = "Ribbon pattern",
}: {
  pattern: RibbonPatternMode;
  className?: string;
  artClassName?: string;
  dial?: boolean;
  dialPanel?: string;
}) {
  const stripeRef = React.useRef<HTMLDivElement>(null);

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col justify-between gap-6 overflow-hidden rounded-[20px] p-6",
        "shadow-[0px_1px_0px_rgba(0,0,0,0.25)]",
        className,
      )}
      style={{ backgroundColor: "#242428" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1.5px_0px_0px_rgba(255,255,255,0.25)]"
      />
      <div
        ref={stripeRef}
        className={cn(
          "relative aspect-[356/210] w-full overflow-hidden bg-[#1a1a1e]",
          artClassName,
        )}
      >
        {dial ? (
          <RibbonFieldDial
            mode={pattern}
            panel={dialPanel}
            boundsRef={stripeRef}
          />
        ) : (
          <RibbonField mode={pattern} boundsRef={stripeRef} />
        )}
      </div>
      <div className="relative flex flex-col gap-3.5 text-white">
        <p className="text-balance text-[28px] leading-[1.15] tracking-[-1.12px]">
          {HERO_COPY.title}
        </p>
        <p className="text-[16px] leading-[1.4] tracking-[-0.24px] text-white/70">
          {HERO_COPY.body}
        </p>
      </div>
    </aside>
  );
}

export function TiersShell({ children }: { children: React.ReactNode }) {
  return children;
}

export function allSponsorSlots() {
  return TIERS.flatMap((tier) =>
    TIER_SPONSORS[TIER_KEY[tier]].map((s, i) => ({
      tier,
      sponsor: s,
      index: i,
    })),
  );
}
