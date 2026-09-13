"use client";

import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  CURRENT_SPONSORS,
  FAQ,
  GhostCta,
  MonoLabel,
  PrimaryCta,
  ProtoNav,
  SPONSOR_HREF,
} from "./shared";

/**
 * Letter — intimate single-column note from the creator.
 * Axis: personality / layout (personal letter, not a sales page)
 */
export function Letter() {
  const reduce = useReducedMotion() ?? false;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  const enter = reduce
    ? undefined
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const },
      };

  return (
    <div className="min-h-svh bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <ProtoNav />

      <main className="mx-auto max-w-[42rem] px-5 pb-28 pt-10 sm:px-8 sm:pt-16">
        <motion.div {...enter}>
          <MonoLabel>A note from Urvish</MonoLabel>
          <h1 className="mt-4 text-balance text-[40px] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[48px]">
            uselayouts stays free because people like you keep the lights on.
          </h1>

          <div className="mt-10 space-y-5 text-[17px] leading-[1.65] text-[#071A31]/85">
            <p>
              Every component here is free to copy into your app. No paywall, no
              “pro” tier, no locked motion recipes. That only works if a handful
              of people decide the library is worth keeping alive.
            </p>
            <p>
              If uselayouts has saved you an afternoon — or if your team ships
              with it — sponsor me on GitHub. A coffee covers hosting for a
              month. A company sponsorship keeps the docs and registry online
              for everyone else.
            </p>
            <p className="text-[#071A31]/65">
              — Urvish Mali
              <br />
              <span className="font-[family-name:var(--font-geist-mono)] text-[14px] tracking-[-0.02em]">
                @0xUrvish
              </span>
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <PrimaryCta href={SPONSOR_HREF}>Sponsor on GitHub</PrimaryCta>
            <GhostCta
              onClick={() => {
                void navigator.clipboard.writeText(SPONSOR_HREF);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Link copied" : "Copy sponsor link"}
            </GhostCta>
          </div>
        </motion.div>

        <section className="mt-16 border-t border-[#071A31]/10 pt-10">
          <MonoLabel>What your support covers</MonoLabel>
          <ul className="mt-5 space-y-4">
            {[
              "Hosting, CDN, and the component registry",
              "New motion components and docs examples",
              "Keeping every recipe free — forever",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[16px] leading-snug text-[#071A31]/85"
              >
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-[#071A31]/40"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-[#071A31]/10 pt-10">
          <MonoLabel>People already here</MonoLabel>
          {CURRENT_SPONSORS.length === 0 ? (
            <p className="mt-5 text-[16px] text-[#071A31]/60">
              No sponsors yet — you could be the first.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-[#071A31]/08">
              {CURRENT_SPONSORS.map((s) => (
                <li
                  key={s.handle}
                  className="flex flex-col gap-0.5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-medium tracking-[-0.01em]">
                      {s.name}
                    </p>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[13px] text-[#071A31]/50">
                      {s.handle}
                    </p>
                  </div>
                  <p className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums tracking-wide text-[#071A31]/45 uppercase">
                    since {s.since}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-14 border-t border-[#071A31]/10 pt-10 pb-8">
          <MonoLabel>Questions</MonoLabel>
          <div className="mt-4 divide-y divide-[#071A31]/08">
            {FAQ.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-[16px] font-medium tracking-[-0.01em] transition-opacity duration-150 hover:opacity-70"
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    {item.q}
                    <span
                      aria-hidden
                      className="font-[family-name:var(--font-geist-mono)] text-[18px] text-[#071A31]/40"
                    >
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open ? (
                    <p className="max-w-prose pb-4 text-[15px] leading-relaxed text-[#071A31]/70">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
