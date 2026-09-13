"use client";

import * as React from "react";
import { ProtoNav, SPONSOR_HREF } from "./shared";

export { SPONSOR_HREF };
import { RibbonField, RibbonFieldDial, type RibbonPatternMode } from "./ribbon-pattern";
import { cn } from "@/lib/utils";

export const TIERS = ["Gold", "Silver", "Bronze"] as const;

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
  Gold: [
    {
      name: "International Business Machines Corporation",
      abbr: "IBM",
      color: "#0F62FE",
      href: "https://ibm.com",
      since: "Jan 2024",
    },
    {
      name: "Vercel",
      abbr: "▲",
      color: "#000000",
      href: "https://vercel.com",
      since: "Mar 2025",
    },
    null,
  ],
  Silver: [
    {
      name: "Linear",
      abbr: "LN",
      color: "#5E6AD2",
      href: "https://linear.app",
      since: "Jun 2025",
    },
    {
      name: "Stripe",
      abbr: "S",
      color: "#635BFF",
      href: "https://stripe.com",
      since: "Apr 2025",
    },
    {
      name: "Acme Design Systems International LLC",
      abbr: "AD",
      color: "#BC6147",
      href: "https://example.com",
      since: "Aug 2025",
    },
  ],
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
  mode = "marks",
}: {
  sponsor: SponsorEntry | null;
  shape: (typeof SLOT_SHAPES)[number];
  mode?: SponsorLogoMode;
}) {
  const label = sponsor
    ? `Visit ${sponsor.name} sponsor page`
    : "Become a sponsor";

  return (
    <a
      href={sponsor?.href ?? SPONSOR_HREF}
      target="_blank"
      rel="noreferrer"
      className="group relative block min-w-0 flex-1 transition-opacity duration-150 hover:opacity-90 active:scale-[0.99]"
      aria-label={label}
    >
      <div className="relative mx-auto h-[100px] w-full max-w-full min-w-0 sm:h-[120px] [&_img]:pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shape.src}
          alt=""
          width={shape.w}
          height={shape.h}
          className="size-full object-contain object-center"
          draggable={false}
        />
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center px-3",
            !sponsor &&
              "transition-[background-color] duration-150 group-hover:bg-white/30",
          )}
        >
          <TicketSlotContent sponsor={sponsor} mode={mode} />
        </span>
      </div>
    </a>
  );
}

export function SponsorChip({ sponsor }: { sponsor: SponsorEntry | null }) {
  if (!sponsor) {
    return (
      <a
        href={SPONSOR_HREF}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-dashed border-[#071A31]/20 bg-white/60 px-4 text-[13px] font-medium text-[#071A31]/55 transition-[background-color,border-color] duration-150 hover:border-[#071A31]/35 hover:bg-white active:scale-[0.99]"
        aria-label="Become a sponsor"
      >
        <PlusIcon />
        Open slot
      </a>
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

export function SponsorGridCard({ sponsor }: { sponsor: SponsorEntry | null }) {
  if (!sponsor) {
    return (
      <a
        href={SPONSOR_HREF}
        target="_blank"
        rel="noreferrer"
        className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#071A31]/18 bg-[#f9f8f5] text-[#071A31]/50 transition-[border-color,background-color] duration-150 hover:border-[#071A31]/30 hover:bg-white active:scale-[0.99]"
        aria-label="Become a sponsor"
      >
        <PlusIcon />
        <span className="text-[12px] font-medium">Open slot</span>
      </a>
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
  return (
    <section
      className="w-full overflow-hidden rounded-[14px] border border-[#e2e2e2] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.02)]"
      aria-label={`${label} sponsors`}
    >
      <div className={cn("flex items-center bg-[#f9f8f5] px-4", compact ? "py-2.5" : "py-3")}>
        <h2 className="text-[18px] leading-[1.15] tracking-[-0.72px] text-black">{label}</h2>
      </div>
      <div
        className={cn(
          "grid min-h-[140px] grid-cols-3 items-center gap-2 border-t border-[#e2e2e2] bg-[#f9f8f5] px-3 py-6 sm:min-h-[160px] sm:gap-3 sm:px-4 sm:py-8",
          compact && "min-h-[120px] gap-2 py-5",
        )}
      >
        {SLOT_SHAPES.map((shape, i) => (
          <SponsorTicketSlot
            key={`${label}-${shape.src}`}
            sponsor={sponsors[i] ?? null}
            shape={shape}
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
          <SponsorChip key={`${label}-${i}`} sponsor={s} />
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
  return (
    <div className="flex min-h-svh flex-col bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31] antialiased">
      <ProtoNav active="Sponsor" cta="explore" />
      {children}
    </div>
  );
}

export function allSponsorSlots() {
  return TIERS.flatMap((tier) =>
    TIER_SPONSORS[tier].map((s, i) => ({ tier, sponsor: s, index: i })),
  );
}
