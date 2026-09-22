"use client";

/* eslint-disable @next/next/no-img-element -- static SVG marks, no optimisation needed. */

import Link from "next/link";
import { useState } from "react";

import { formatStarCount, GITHUB_URL } from "@/lib/github";
import { BrandLogo } from "@/components/brand-logo";

export const landingNavLinks = [
  { label: "Component", href: "/browse" },
  { label: "Documentation", href: "/docs" },
  { label: "Sponsor", href: "/sponsor" },
] as const;

function GithubMarkLink({ stars }: { stars?: number | null }) {
  const count = typeof stars === "number" ? formatStarCount(stars) : null;
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={count ? `useLayouts on GitHub, ${count} stars` : "useLayouts on GitHub"}
      className="dark relative flex items-center gap-1.5 overflow-hidden rounded-xl bg-secondary py-2 pr-2.5 pl-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.1)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-b from-transparent to-black/6 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)]"
      />
      <img src="/brand/icon-github.svg" alt="" width={20} height={20} className="relative size-5" />
      {count ? (
        <span className="relative text-[13px] leading-none font-medium text-secondary-foreground tabular-nums">
          {count}
        </span>
      ) : null}
    </a>
  );
}

export function LandingNav({
  githubStars,
}: {
  githubStars?: number | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 flex h-[70px] items-center justify-between px-4 sm:px-8 lg:px-12">
      <Link href="/" aria-label="uselayouts home" className="shrink-0">
        <BrandLogo />
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
        {landingNavLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-[15px] text-[#071A31] transition-opacity duration-150 hover:opacity-70"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <GithubMarkLink stars={githubStars} />
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-10 items-center justify-center rounded-2xl text-[#071A31] transition-opacity duration-150 hover:opacity-70 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            {open ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-4 top-[70px] z-30 flex flex-col gap-4 rounded-2xl border border-black/5 bg-[#F5F3EE] p-5 shadow-lg lg:hidden">
          {landingNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] text-[#071A31] transition-opacity duration-150 hover:opacity-70"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
