"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const landingNavLinks = [
  { label: "Component", href: "/browse" },
  { label: "Documentation", href: "/docs/installation" },
  { label: "Meet Creator", href: "https://urvish.in" },
  { label: "Sponsor", href: "/sponsor" },
] as const;

const outlineButtonStyle = {
  backgroundImage: "none",
  boxShadow: [
    "inset 0 1px 0 rgba(255,255,255,0.7)",
    "inset 0 0 0 1.5px rgba(7,26,49,0.2)",
    "0 1px 2px rgba(7,26,49,0.04)",
  ].join(", "),
} as const;

function StarOnGithub({ className }: { className?: string }) {
  return (
    <a
      href="https://github.com/iurvish/uselayouts"
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-[15px] font-medium transition-[transform,filter,background-color] duration-150 ease-out active:scale-[0.96] bg-transparent text-[#071A31] hover:bg-[#071A31]/[0.04]",
        className,
      )}
      style={outlineButtonStyle}
    >
      <Star className="size-3.5 fill-[#071A31] text-[#071A31]" aria-hidden />
      Star on GitHub
    </a>
  );
}

export function LandingNav({
  logoSrc = "/logomark-landing.svg",
}: {
  logoSrc?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 flex h-[70px] items-center justify-between px-4 sm:px-8 lg:px-12">
      <Link href="/" aria-label="uselayouts home" className="shrink-0">
        <Image
          src={logoSrc}
          alt="uselayouts"
          width={128}
          height={30}
          className="h-[30px] w-auto"
          priority
        />
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
        <StarOnGithub className="hidden h-9 sm:inline-flex" />
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
          <StarOnGithub className="w-full sm:hidden" />
        </div>
      ) : null}
    </header>
  );
}
