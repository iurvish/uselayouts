"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SPONSOR_HREF = "https://github.com/sponsors/iurvish";

export const primaryBtnShadow = [
  "inset 0 1.5px 0 rgba(255,255,255,0.28)",
  "inset 0 -2px 0 rgba(0,0,0,0.45)",
  "inset 0 0 0 1px rgba(255,255,255,0.06)",
  "0 1px 0 rgba(255,255,255,0.1)",
  "0 3px 0 rgba(0,0,0,0.25)",
  "0 8px 12px rgba(7,26,49,0.35)",
].join(", ");

export const outlineBtnShadow = [
  "inset 0 1px 0 rgba(255,255,255,0.7)",
  "inset 0 0 0 1.5px rgba(7,26,49,0.2)",
  "0 1px 2px rgba(7,26,49,0.04)",
].join(", ");

export const cardShadow = [
  "inset 0 1px 0 rgba(255,255,255,0.7)",
  "0 1px 2px rgba(7,26,49,0.04)",
  "0 4px 12px rgba(7,26,49,0.06)",
].join(", ");

/** Worst-case names that break tight layouts */
export const CURRENT_SPONSORS = [
  {
    name: "International Business Machines Corporation",
    handle: "@ibm",
    since: "Jan 2024",
  },
  {
    name: "Vercel",
    handle: "@vercel",
    since: "Mar 2025",
  },
  {
    name: "Acme Design Systems International LLC",
    handle: "@acme-design-systems-intl",
    since: "Aug 2025",
  },
] as const;

export const FAQ = [
  {
    q: "Where does my brand show up?",
    a: "Company sponsors get a logo on the homepage footer strip and a linked mark on /browse. Individual sponsors are listed on this page with a thank-you note — no logo placement.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. GitHub Sponsors lets you pause or cancel from your account. Logo placements come down at the end of the billing period.",
  },
  {
    q: "Do you take one-time payments?",
    a: "Coffee and thank-you tiers are one-time. Company placement is monthly so we can keep the logo wall honest.",
  },
  {
    q: "What if my company name is extremely long?",
    a: "We truncate on the logo wall with a tooltip for the full legal name. Prefer a short wordmark SVG when you can.",
  },
] as const;

export function ProtoNav({
  active = "Sponsor",
  cta = "github",
}: {
  active?: string;
  cta?: "github" | "explore";
}) {
  const links = [
    { label: "Component", href: "/browse" },
    { label: "Documentation", href: "/docs/installation" },
    { label: "Meet Creator", href: "https://urvish.in" },
    { label: "Sponsor", href: "/sponsor" },
  ];
  return (
    <header className="relative z-20 flex h-[70px] items-center justify-between px-4 sm:px-8 lg:px-[47px]">
      <Link href="/" aria-label="uselayouts home" className="shrink-0">
        <Image
          src="/logomark.svg"
          alt="uselayouts"
          width={128}
          height={30}
          className="h-[30px] w-auto"
          priority
        />
      </Link>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={cn(
              "text-[15px] transition-opacity duration-150 hover:opacity-70",
              link.label === active
                ? "font-medium text-[#071A31]"
                : "text-[#071A31]/80",
            )}
            aria-current={link.label === active ? "page" : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
      {cta === "explore" ? (
        <Link
          href="/browse"
          className="hidden items-center justify-center rounded-full bg-[#071A31] px-3.5 py-3 text-[16px] font-medium text-white transition-[transform,filter] duration-150 ease-out hover:brightness-110 active:scale-[0.96] sm:inline-flex"
        >
          Explore Components
        </Link>
      ) : (
        <a
          href="https://github.com/iurvish/uselayouts"
          target="_blank"
          rel="noreferrer"
          className="hidden h-10 items-center rounded-xl px-3.5 text-[15px] font-medium text-[#071A31] transition-[transform,filter] duration-150 ease-out active:scale-[0.96] sm:inline-flex"
          style={{ boxShadow: outlineBtnShadow }}
        >
          Star on GitHub
        </a>
      )}
    </header>
  );
}

export function PrimaryCta({
  href = SPONSOR_HREF,
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex h-12 min-h-11 items-center justify-center rounded-xl bg-[#071A31] px-5 text-[16px] font-medium text-white transition-[transform,filter] duration-150 ease-out hover:brightness-110 active:scale-[0.96]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(180deg, #1a3558 0%, #071A31 48%, #040e1a 100%)",
        boxShadow: primaryBtnShadow,
      }}
    >
      {children}
    </a>
  );
}

export function GhostCta({
  href,
  children,
  className,
  onClick,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const cls = cn(
    "inline-flex h-12 min-h-11 items-center justify-center rounded-xl px-5 text-[16px] font-medium text-[#071A31] transition-[transform,background-color] duration-150 ease-out hover:bg-[#071A31]/[0.04] active:scale-[0.96]",
    className,
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} style={{ boxShadow: outlineBtnShadow }}>
        {children}
      </button>
    );
  }
  return (
    <a
      href={href}
      className={cls}
      style={{ boxShadow: outlineBtnShadow }}
    >
      {children}
    </a>
  );
}

export function MonoLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.08em] text-[#071A31]/55 uppercase">
      {children}
    </p>
  );
}
