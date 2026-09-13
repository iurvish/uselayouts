"use client";

import { useReducedMotion, motion } from "motion/react";
import { useState } from "react";
import {
  GhostCta,
  MonoLabel,
  PrimaryCta,
  ProtoNav,
  SPONSOR_HREF,
  cardShadow,
  outlineBtnShadow,
} from "./shared";
import { cn } from "@/lib/utils";

const PLACEMENTS = [
  {
    id: "footer",
    label: "Homepage footer",
    desc: "Wordmark strip above the dark footer — every landing visit.",
    price: "$199/mo",
  },
  {
    id: "browse",
    label: "Browse sidebar",
    desc: "Linked mark beside the component gallery. High-intent traffic.",
    price: "$149/mo",
  },
  {
    id: "docs",
    label: "Docs rail",
    desc: "Quiet presence on installation + component pages.",
    price: "$99/mo",
  },
] as const;

/**
 * Billboard — sell the placement itself as the hero product.
 * Axis: layout (visual inventory first, packages second)
 */
export function Billboard() {
  const reduce = useReducedMotion() ?? false;
  const [slot, setSlot] = useState<(typeof PLACEMENTS)[number]["id"]>("footer");
  const [previewName, setPreviewName] = useState("Acme Design Systems");
  const active = PLACEMENTS.find((p) => p.id === slot)!;

  return (
    <div className="min-h-svh bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <ProtoNav />

      <main className="pb-32">
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8 sm:pt-12">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <MonoLabel>Brand placement</MonoLabel>
              <h1 className="mt-3 text-balance text-[36px] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[44px]">
                Your mark, where designers open components.
              </h1>
              <p className="mt-4 max-w-prose text-[16px] leading-relaxed text-[#071A31]/70">
                Sponsorship here isn’t a badge buried on a thanks page — it’s a
                real slot on uselayouts. Flip the inventory below and see the
                placement light up.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {PLACEMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={slot === p.id}
                  onClick={() => setSlot(p.id)}
                  className={cn(
                    "inline-flex h-11 min-h-11 items-center rounded-full px-4 text-[14px] font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96]",
                    slot === p.id
                      ? "bg-[#071A31] text-white"
                      : "bg-transparent text-[#071A31]/75 hover:bg-[#071A31]/[0.05]",
                  )}
                  style={
                    slot === p.id
                      ? undefined
                      : { boxShadow: outlineBtnShadow }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live placement stage */}
        <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-8">
          <div
            className="overflow-hidden rounded-[20px] bg-[#232323]"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.2), 0 12px 40px rgba(7,26,49,0.18)",
            }}
          >
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="ml-3 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-white/35">
                uselayouts.com
                {slot === "browse"
                  ? "/browse"
                  : slot === "docs"
                    ? "/docs/installation"
                    : ""}
              </span>
            </div>

            <div className="relative min-h-[320px] bg-[#F5F3EE] sm:min-h-[380px]">
              {/* Fake chrome matching placement */}
              {slot === "footer" ? (
                <FooterPreview
                  name={previewName}
                  reduce={reduce}
                />
              ) : null}
              {slot === "browse" ? (
                <BrowsePreview name={previewName} reduce={reduce} />
              ) : null}
              {slot === "docs" ? (
                <DocsPreview name={previewName} reduce={reduce} />
              ) : null}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 sm:px-8 lg:grid-cols-[1fr_20rem]">
          <div>
            <MonoLabel>Selected inventory</MonoLabel>
            <h2 className="mt-2 text-[24px] font-medium tracking-[-0.02em]">
              {active.label}
            </h2>
            <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-[#071A31]/70">
              {active.desc}
            </p>

            <label className="mt-8 block max-w-md">
              <span className="text-[13px] font-medium text-[#071A31]/65">
                Preview with your brand name
              </span>
              <input
                type="text"
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
                spellCheck={false}
                autoComplete="organization"
                className="mt-2 h-11 w-full rounded-xl border-0 bg-white px-3.5 text-[16px] text-[#071A31] outline-none ring-1 ring-[#071A31]/12 transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-[#071A31]/35"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}
              />
            </label>
          </div>

          <aside
            className="flex flex-col rounded-2xl bg-white p-6"
            style={{ boxShadow: cardShadow }}
          >
            <p className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.06em] text-[#071A31]/45 uppercase">
              From
            </p>
            <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[32px] font-medium tabular-nums tracking-[-0.03em]">
              {active.price}
            </p>
            <ul className="mt-5 space-y-2.5 text-[13px] leading-snug text-[#071A31]/70">
              <li>SVG wordmark, light + dark</li>
              <li>Link to a URL you choose</li>
              <li>Swap creative once per month</li>
              <li>Cancel anytime via GitHub Sponsors</li>
            </ul>
            <div className="mt-6 flex flex-col gap-2">
              <PrimaryCta href={SPONSOR_HREF} className="w-full">
                Sponsor this slot
              </PrimaryCta>
              <GhostCta href="mailto:urvish@uselayouts.com" className="w-full">
                Ask about exclusivity
              </GhostCta>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SponsorChip({
  name,
  pulse,
}: {
  name: string;
  pulse?: boolean;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-[13px] font-medium text-[#071A31]",
        pulse && "ring-2 ring-[#BC6147]/80 ring-offset-2 ring-offset-[#232323]",
      )}
      style={{ boxShadow: cardShadow }}
      initial={pulse ? { scale: 0.97, opacity: 0.7 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
    >
      <span
        aria-hidden
        className="size-5 shrink-0 rounded-md bg-[#071A31]/10"
      />
      <span className="truncate">{name || "Your brand"}</span>
    </motion.div>
  );
}

function FooterPreview({
  name,
  reduce,
}: {
  name: string;
  reduce: boolean;
}) {
  return (
    <div className="flex h-full min-h-[320px] flex-col sm:min-h-[380px]">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-[#071A31]/35 uppercase">
          Landing · above footer
        </p>
        <p className="max-w-sm text-[15px] text-[#071A31]/45">
          Cream page content fades into the dark footer. Your slot sits in the
          sponsor strip.
        </p>
      </div>
      <div className="bg-[#232323] px-5 py-6 sm:px-8">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.1em] text-white/35 uppercase">
          Sponsored by
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <SponsorChip name={name} pulse={!reduce} />
          <span className="inline-flex items-center rounded-lg border border-dashed border-white/20 px-3 py-2 text-[12px] text-white/30">
            Open slot
          </span>
        </div>
      </div>
    </div>
  );
}

function BrowsePreview({
  name,
  reduce,
}: {
  name: string;
  reduce: boolean;
}) {
  return (
    <div className="grid min-h-[320px] grid-cols-[9rem_1fr] sm:min-h-[380px] sm:grid-cols-[12rem_1fr]">
      <aside className="border-r border-[#071A31]/08 bg-white/40 p-3 sm:p-4">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-wide text-[#071A31]/35 uppercase">
          Browse
        </p>
        <div className="mt-4 space-y-2">
          {["Layouts", "Navigation", "Interactions"].map((l) => (
            <div
              key={l}
              className="h-7 rounded-md bg-[#071A31]/[0.04] px-2 text-[11px] leading-7 text-[#071A31]/50"
            >
              {l}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[9px] tracking-wide text-[#071A31]/35 uppercase">
            Sponsor
          </p>
          <SponsorChip name={name} pulse={!reduce} />
        </div>
      </aside>
      <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/80"
            style={{ boxShadow: "inset 0 0 0 1px rgba(7,26,49,0.06)" }}
          >
            <div className="aspect-[4/3] rounded-t-xl bg-[#071A31]/[0.04]" />
            <div className="space-y-1.5 p-2.5">
              <div className="h-2 w-2/3 rounded bg-[#071A31]/10" />
              <div className="h-2 w-1/2 rounded bg-[#071A31]/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocsPreview({
  name,
  reduce,
}: {
  name: string;
  reduce: boolean;
}) {
  return (
    <div className="grid min-h-[320px] grid-cols-1 sm:min-h-[380px] sm:grid-cols-[1fr_11rem]">
      <div className="space-y-3 p-6 sm:p-8">
        <div className="h-3 w-24 rounded bg-[#071A31]/10" />
        <div className="h-8 w-3/4 max-w-sm rounded bg-[#071A31]/12" />
        <div className="space-y-2 pt-2">
          <div className="h-2.5 w-full rounded bg-[#071A31]/[0.06]" />
          <div className="h-2.5 w-[92%] rounded bg-[#071A31]/[0.06]" />
          <div className="h-2.5 w-[80%] rounded bg-[#071A31]/[0.06]" />
        </div>
        <div
          className="mt-4 h-28 rounded-xl bg-[#071A31]/[0.04]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(7,26,49,0.06)" }}
        />
      </div>
      <aside className="border-t border-[#071A31]/08 bg-white/50 p-4 sm:border-t-0 sm:border-l">
        <p className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-wide text-[#071A31]/35 uppercase">
          On this page
        </p>
        <div className="mt-3 space-y-2">
          {["Install", "Usage", "API"].map((l) => (
            <div key={l} className="h-2 w-16 rounded bg-[#071A31]/[0.08]" />
          ))}
        </div>
        <div className="mt-8">
          <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[9px] tracking-wide text-[#071A31]/35 uppercase">
            Sponsor
          </p>
          <SponsorChip name={name} pulse={!reduce} />
        </div>
      </aside>
    </div>
  );
}
