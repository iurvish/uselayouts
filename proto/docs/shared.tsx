"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { DocsTableOfContents } from "@/components/mdx/table-of-content";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export type DocTocItem = {
  title?: React.ReactNode;
  url: string;
  depth: number;
};

export const DOC_TOC: DocTocItem[] = [
  { title: "1. Add the registry", url: "#add-registry", depth: 2 },
  { title: "2. Add a component", url: "#add-component", depth: 2 },
  { title: "3. Prerequisites", url: "#prerequisites", depth: 2 },
  { title: "Package managers", url: "#package-managers", depth: 3 },
  { title: "Multiple components at once", url: "#multiple-components", depth: 3 },
  {
    title: "4. Configure your project for long component names and nested import paths",
    url: "#configure",
    depth: 2,
  },
  { title: "Troubleshooting common setup issues", url: "#troubleshooting", depth: 2 },
];

const navLinks = [
  { label: "Browse", href: "/browse" },
  { label: "Documentation", href: "/docs/installation" },
  { label: "Sponsor", href: "/sponsor" },
];

export function DocsProtoNav({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-sm sm:px-6",
        className,
      )}
    >
      <Link href="/" aria-label="uselayouts home" className="shrink-0">
        <Image
          src="/logomark.svg"
          alt="uselayouts"
          width={108}
          height={26}
          className="h-[22px] w-auto dark:invert"
          priority
        />
      </Link>

      <nav className="hidden items-center gap-5 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <ThemeToggle />
    </header>
  );
}

/** Mounts the existing airplane TOC sticky on the left — component internals unchanged. */
export function StickyAirplaneToc({
  toc,
  className,
  top = "5.5rem",
}: {
  toc: DocTocItem[];
  className?: string;
  top?: string;
}) {
  return (
    <aside
      className={cn("hidden w-[220px] shrink-0 self-start lg:block", className)}
      style={{ position: "sticky", top }}
    >
      <DocsTableOfContents toc={toc} className="px-0 pt-0" />
    </aside>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      className="overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed text-foreground/90"
    >
      <code>{children}</code>
    </pre>
  );
}

export function DocsContent({
  sectionStyle = "default",
}: {
  sectionStyle?: "default" | "numbered" | "compact";
}) {
  const sectionClass =
    sectionStyle === "compact"
      ? "scroll-mt-28 border-b border-border/50 pb-8"
      : sectionStyle === "numbered"
        ? "scroll-mt-28 border-t border-border/60 pt-14 first:border-t-0 first:pt-0"
        : "scroll-mt-28 space-y-4";

  const h2Class =
    sectionStyle === "compact"
      ? "text-lg font-semibold tracking-tight"
      : sectionStyle === "numbered"
        ? "text-2xl font-semibold tracking-tight sm:text-[1.65rem]"
        : "text-xl font-semibold tracking-tight";

  const bodyClass =
    sectionStyle === "compact"
      ? "text-[13px] leading-6 text-muted-foreground"
      : "text-[15px] leading-7 text-muted-foreground";

  const Section = ({
    id,
    number,
    title,
    children,
  }: {
    id: string;
    number?: string;
    title: string;
    children: ReactNode;
  }) => (
    <section id={id} className={sectionClass}>
      {sectionStyle === "numbered" && number ? (
        <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-muted-foreground/50 uppercase">
          {number}
        </p>
      ) : null}
      <h2 className={h2Class}>{title}</h2>
      <div className={cn("mt-4 space-y-4", bodyClass)}>{children}</div>
    </section>
  );

  return (
    <article className={sectionStyle === "numbered" ? "space-y-14" : "space-y-10"}>
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground/60 uppercase">
          Documentation
        </p>
        <h1
          className={cn(
            "max-w-[18ch] font-semibold tracking-tight text-balance",
            sectionStyle === "compact"
              ? "text-2xl"
              : "text-4xl sm:text-5xl sm:leading-[1.05]",
          )}
        >
          Installation
        </h1>
        <p className={cn("max-w-prose", bodyClass)}>
          uselayouts is a shadcn registry. Add the namespace once, then install
          any component with{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
            @uselayouts/&#123;name&#125;
          </code>
          .
        </p>
      </header>

      <Section id="add-registry" number="01" title="Add the registry">
        <p>In your project&apos;s <code className="font-mono text-foreground">components.json</code>:</p>
        <CodeBlock>
{`{
  "registries": {
    "@uselayouts": "https://uselayouts.com/r/{name}.json"
  }
}`}
        </CodeBlock>
      </Section>

      <Section id="add-component" number="02" title="Add a component">
        <CodeBlock>npx shadcn@latest add @uselayouts/discrete-tabs</CodeBlock>
        <p>
          The CLI copies the component into your project and installs peer
          dependencies. You own the code from that point forward.
        </p>
      </Section>

      <Section id="prerequisites" number="03" title="Prerequisites">
        <p>Components expect:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>React 18+</li>
          <li>Tailwind CSS</li>
          <li>Motion (and other deps the CLI installs for you)</li>
        </ul>

        <h3
          id="package-managers"
          className="mt-6 scroll-mt-28 text-base font-medium text-foreground"
        >
          Package managers
        </h3>
        <p>pnpm, yarn, and bun work the same way:</p>
        <CodeBlock>pnpm dlx shadcn@latest add @uselayouts/discrete-tabs</CodeBlock>

        <h3
          id="multiple-components"
          className="mt-6 scroll-mt-28 text-base font-medium text-foreground"
        >
          Multiple components at once
        </h3>
        <CodeBlock>
          npx shadcn@latest add @uselayouts/delete-button @uselayouts/status-button
        </CodeBlock>
      </Section>

      <Section
        id="configure"
        number="04"
        title="Configure your project for long component names and nested import paths"
      >
        <p>
          If your app uses path aliases or a monorepo layout, make sure{" "}
          <code className="font-mono text-foreground">components.json</code>{" "}
          points at the directory where shadcn should write files. The registry
          does not guess your folder structure.
        </p>
        <CodeBlock>
{`{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}`}
        </CodeBlock>
      </Section>

      <Section
        id="troubleshooting"
        number="05"
        title="Troubleshooting common setup issues"
      >
        <p>
          Browse the{" "}
          <Link href="/docs/components/pricing-card" className="text-foreground underline-offset-4 hover:underline">
            components gallery
          </Link>
          , copy the command, and run it in your app. If a component fails to
          resolve, confirm the registry URL and that your package manager can
          reach uselayouts.com.
        </p>
      </Section>
    </article>
  );
}

export const SITE_NAV_LINKS = [
  { label: "Browse", href: "/browse" },
  { label: "Docs", href: "/docs/installation" },
  { label: "Sponsor", href: "/sponsor" },
] as const;
