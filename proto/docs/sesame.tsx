"use client";

import Link from "next/link";
import {
  DOC_TOC,
  DocsContent,
  DocsProtoNav,
  SITE_NAV_LINKS,
  StickyAirplaneToc,
} from "./shared";

export function SesameDocs() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <DocsProtoNav />

      <div className="mx-auto flex max-w-[1400px]">
        <nav
          aria-label="Site"
          className="hidden w-[148px] shrink-0 border-r border-border/50 px-5 py-10 xl:block"
        >
          <ul className="space-y-4">
            {SITE_NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 gap-10 px-4 py-10 sm:px-8 lg:gap-14 lg:px-12 lg:py-14">
          <StickyAirplaneToc toc={DOC_TOC} top="5.5rem" />

          <main className="min-w-0 max-w-[42rem] flex-1 pb-24">
            <DocsContent sectionStyle="numbered" />
          </main>
        </div>
      </div>
    </div>
  );
}
