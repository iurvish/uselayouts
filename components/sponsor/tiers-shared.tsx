"use client";

import * as React from "react";
import { SPONSOR_HREF } from "./shared";

export { SPONSOR_HREF };
import { RibbonField, RibbonFieldDial, type RibbonPatternMode } from "./ribbon-pattern";
import { cn } from "@/lib/utils";
import { startSponsorCheckout } from "@/lib/sponsor/checkout";
import { SPONSOR_PLANS, type SponsorTier } from "@/lib/sponsor/plans";

export const TIERS = ["Gold", "Silver", "Bronze"] as const;

const TIER_KEY: Record<(typeof TIERS)[number], SponsorTier> = {
  Gold: "gold",
  Silver: "silver",
  Bronze: "bronze",
};

export type SponsorLogoMode = "marks" | "names" | "mixed" | "chips" | "rows";

export type SponsorEntry = {
  name: string;
  abbr: string;
  color: string;
  href: string;
  since?: string;
};

export const TIER_SPONSORS: Record<
  (typeof TIERS)[number],
  (SponsorEntry | null)[]
> = {
  Gold: [null, null, null],
  Silver: [null, null, null],
  Bronze: [null, null, null],
};

export const SLOT_SHAPES = [
  { src: "/sponsor/slot-left.png", w: 256, h: 132 },
  { src: "/sponsor/slot-center.png", w: 262, h: 135 },
  { src: "/sponsor/slot-right.png", w: 262, h: 135 },
] as const;

export const HERO_COPY = {
  title: "useLayouts stays free because people like you keep the lights on",
  body:
    "This library needs you. Be the backbone that keeps this library standing strong. Help us keep it free for everyone",
} as const;

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
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
  const sizes = { sm: "size-8 text-[11px]", md: "size-11 text-[13px]", lg: "size-14 text-[15px]" };
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
      className="flex size-[34px] items-center justify-center rounded-[10px] border border-[rgba(75,86,94,0.4)] text-[#767D84]"
      aria-hidden
    >
      <PlusIcon />
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
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => void checkout.onClick()}
          disabled={checkout.pending}
          className="group relative block w-full min-w-0 transition-opacity duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
          aria-label={label}
        >
          <TicketFace sponsor={null} shape={shape} mode={mode} />
        </button>
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
      className="group relative block min-w-0 flex-1 transition-opacity duration-150 hover:opacity-90 active:scale-[0.99]"
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
    <div className="relative mx-auto h-[100px] w-full max-w-full min-w-0 sm:h-[120px] [&_img]:pointer-events-none">
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
        className="absolute inset-0 size-full object-contain object-center mix-blend-multiply"
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

export function TierTickets({
  label,
  compact,
}: {
  label: (typeof TIERS)[number];
  compact?: boolean;
}) {
  const sponsors = TIER_SPONSORS[label];
  const tier = TIER_KEY[label];
  const plan = SPONSOR_PLANS[tier];
  return (
    <section
      className="w-full overflow-hidden rounded-[14px] border border-[#e2e2e2] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02)]"
      aria-label={`${label} sponsors`}
    >
      <div
        className={cn(
          "flex items-baseline justify-between gap-3 px-4",
          compact ? "py-2.5" : "py-3",
        )}
      >
        <h2 className="text-[18px] leading-[1.15] tracking-[-0.72px] text-black">
          {label}
        </h2>
        <p className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.04em] text-[#071A31]/55">
          ${plan.priceUsd}/mo
        </p>
      </div>
      <div
        className={cn(
          "grid grid-cols-1 items-center gap-3 border-t border-[#e2e2e2] px-3 py-5 sm:grid-cols-3 sm:min-h-[160px] sm:gap-3 sm:px-4 sm:py-8",
          compact && "sm:min-h-[120px] gap-2 py-5",
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
    </section>
  );
}

export function TierChips({ label }: { label: (typeof TIERS)[number] }) {
  const sponsors = TIER_SPONSORS[label];
  const slots = [...sponsors, ...Array(Math.max(0, 3 - sponsors.length)).fill(null)].slice(0, 3);
  return (
    <section className="rounded-[14px] border border-[#e2e2e2] bg-[#f9f8f5] p-4 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02)]">
      <h2 className="text-[18px] leading-[1.15] tracking-[-0.72px] text-black">{label}</h2>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slots.map((s, i) => (
          <SponsorChip key={`${label}-${i}`} sponsor={s} tier={TIER_KEY[label]} />
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
          <RibbonFieldDial mode={pattern} panel={dialPanel} boundsRef={stripeRef} />
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
    TIER_SPONSORS[tier].map((s, i) => ({ tier, sponsor: s, index: i })),
  );
}
