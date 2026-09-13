"use client";

import { useReducedMotion, motion, AnimatePresence } from "motion/react";
import { useId, useState } from "react";
import {
  GhostCta,
  MonoLabel,
  PrimaryCta,
  ProtoNav,
  SPONSOR_HREF,
  cardShadow,
} from "./shared";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    id: "coffee",
    name: "Buy me a coffee",
    price: "$5",
    period: "one-time",
    blurb: "Say thanks. No logo, no fuss.",
    benefits: [
      "Name on the sponsors list",
      "Warm fuzzy feeling",
      "Helps cover a week of hosting",
    ],
    cta: "Send $5 on GitHub",
  },
  {
    id: "builder",
    name: "Builder",
    price: "$19",
    period: "/ month",
    blurb: "For individuals who ship with uselayouts often.",
    benefits: [
      "Everything in Coffee",
      "Early look at new components",
      "Priority reply on GitHub issues you file",
      "Sponsor badge on your profile mention",
    ],
    cta: "Become a Builder",
    featured: true,
  },
  {
    id: "company",
    name: "Company placement",
    price: "$199",
    period: "/ month",
    blurb:
      "For teams that want their mark next to components developers actually open.",
    benefits: [
      "Everything in Builder",
      "Logo on homepage footer strip",
      "Linked mark on /browse",
      "Custom short blurb (160 chars)",
      "Quarterly placement screenshot for your brand team",
    ],
    cta: "Start company sponsorship",
  },
] as const;

/**
 * Marketplace — tier comparison as the interaction model.
 * Axis: interaction (pick a package, see benefits update)
 */
export function Marketplace() {
  const reduce = useReducedMotion() ?? false;
  const [tierId, setTierId] = useState<(typeof TIERS)[number]["id"]>("builder");
  const [company, setCompany] = useState(
    "International Business Machines Corporation",
  );
  const [sent, setSent] = useState(false);
  const nameId = useId();
  const tier = TIERS.find((t) => t.id === tierId)!;

  return (
    <div className="min-h-svh bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <ProtoNav />

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-10 sm:px-8 sm:pt-14">
        <div className="max-w-2xl">
          <MonoLabel>Sponsorship</MonoLabel>
          <h1 className="mt-3 text-balance text-[36px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[44px]">
            Pick the support that fits — keep the library free for everyone else.
          </h1>
          <p className="mt-4 max-w-prose text-[16px] leading-relaxed text-[#071A31]/70">
            Three clear tiers. No soft “contact sales” wall for the paid
            placements — company sponsors go through GitHub Sponsors like
            everyone else.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_22rem]">
          <div className="grid gap-3 sm:grid-cols-3">
            {TIERS.map((t) => {
              const active = t.id === tierId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTierId(t.id);
                    setSent(false);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "relative flex min-h-[11rem] flex-col rounded-2xl p-5 text-left transition-[transform,box-shadow,background-color] duration-150 ease-out active:scale-[0.98]",
                    active
                      ? "bg-white"
                      : "bg-transparent hover:bg-white/60",
                  )}
                  style={{
                    boxShadow: active
                      ? cardShadow
                      : "inset 0 0 0 1px rgba(7,26,49,0.1)",
                  }}
                >
                  {"featured" in t && t.featured ? (
                    <span className="absolute right-4 top-4 rounded-md bg-[#071A31] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-wide text-white uppercase">
                      Popular
                    </span>
                  ) : null}
                  <p className="pr-16 text-[15px] font-medium tracking-[-0.01em]">
                    {t.name}
                  </p>
                  <p className="mt-3 flex items-baseline gap-1">
                    <span className="font-[family-name:var(--font-geist-mono)] text-[28px] font-medium tabular-nums tracking-[-0.03em]">
                      {t.price}
                    </span>
                    <span className="text-[13px] text-[#071A31]/50">
                      {t.period}
                    </span>
                  </p>
                  <p className="mt-auto pt-4 text-[13px] leading-snug text-[#071A31]/60">
                    {t.blurb}
                  </p>
                </button>
              );
            })}
          </div>

          <aside
            className="flex flex-col rounded-2xl bg-white p-6"
            style={{ boxShadow: cardShadow }}
            aria-live="polite"
          >
            <MonoLabel>Included</MonoLabel>
            <AnimatePresence mode="wait">
              <motion.div
                key={tier.id}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                className="mt-4 flex flex-1 flex-col"
              >
                <h2 className="text-[20px] font-medium tracking-[-0.02em]">
                  {tier.name}
                </h2>
                <ul className="mt-4 flex-1 space-y-3">
                  {tier.benefits.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2.5 text-[14px] leading-snug text-[#071A31]/80"
                    >
                      <span
                        aria-hidden
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#879F6C]"
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                {tier.id === "company" ? (
                  <div className="mt-6 space-y-2 border-t border-[#071A31]/08 pt-5">
                    <label
                      htmlFor={nameId}
                      className="block text-[13px] font-medium text-[#071A31]/70"
                    >
                      Legal company name on the wall
                    </label>
                    <input
                      id={nameId}
                      type="text"
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        setSent(false);
                      }}
                      spellCheck={false}
                      autoComplete="organization"
                      className="h-11 w-full rounded-xl border-0 bg-[#F5F3EE] px-3.5 text-[16px] text-[#071A31] outline-none ring-1 ring-[#071A31]/12 transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-[#071A31]/35"
                    />
                    <p className="text-[12px] leading-snug text-[#071A31]/45">
                      Shown truncated if it wraps past two lines — like the
                      name above.
                    </p>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-2">
                  <PrimaryCta
                    href={SPONSOR_HREF}
                    className="w-full"
                  >
                    {tier.cta}
                  </PrimaryCta>
                  {tier.id === "company" ? (
                    <GhostCta
                      className="w-full"
                      onClick={() => setSent(true)}
                    >
                      {sent
                        ? `Noted — ${company.slice(0, 28)}${company.length > 28 ? "…" : ""}`
                        : "Save name for onboarding"}
                    </GhostCta>
                  ) : null}
                </div>
              </motion.div>
            </AnimatePresence>
          </aside>
        </div>

        <p className="mt-10 max-w-xl text-[13px] leading-relaxed text-[#071A31]/45">
          Billing runs through GitHub Sponsors. Cancel anytime. Logo placements
          for Company come down at period end — we don’t keep orphan marks.
        </p>
      </main>
    </div>
  );
}
