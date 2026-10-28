import type { Metadata } from "next";
import Link from "next/link";

import { LandingNav } from "@/components/landing/landing-nav";
import {
  ComponentListJsonLd,
  FaqJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld";
import { browseItems } from "@/lib/browse/items";
import { getComponentDocsPage, getOpenNavItems } from "@/lib/open/component";
import { getGithubStarCount } from "@/lib/github";
import { canonical } from "@/lib/seo/site";

export const revalidate = 3600;

const TITLE = "Free Animated React Components";
const DESCRIPTION =
  "A free library of animated React components built with Motion and Tailwind CSS. Copy the code or install with the shadcn CLI. MIT licensed, no sign-up.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Copy & Paste UI Library | useLayouts` },
  description: DESCRIPTION,
  ...canonical("/components"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/components" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

const FAQ = [
  {
    question: "Are these React components free?",
    answer:
      "Yes. Every component in the useLayouts library is free and MIT licensed, for personal and commercial work, with no attribution required and no sign-up to browse.",
  },
  {
    question: "How do I install a useLayouts component?",
    answer:
      "Run npx shadcn@latest add followed by the component's registry URL, or open any component page and copy the single .tsx file into your project.",
  },
  {
    question: "What is useLayouts built with?",
    answer:
      "React and TypeScript for the components, Motion (formerly Framer Motion) for animation, and Tailwind CSS for styling. The components work in Next.js, Vite, Remix and any React 18+ setup.",
  },
  {
    question: "Is useLayouts a replacement for shadcn/ui?",
    answer:
      "No. shadcn/ui gives you the unstyled primitives a product needs — dialogs, inputs, selects. useLayouts adds the animated and interactive pieces on top: card stacks, carousels, gooey navbars, drag interactions. Most projects use both.",
  },
  {
    question: "Do the components need a runtime dependency?",
    answer:
      "No. You own the source after you copy it. The only peer dependencies are the ones you already have — React, Tailwind CSS, and Motion for the animated components.",
  },
];

/** Category copy, so each section says something a crawler can use. */
const CATEGORY_BLURB: Record<string, string> = {
  Button:
    "Animated React button components — press states, morphing labels, confirm and delete interactions.",
  Display:
    "React components for showing content off: 3D cards, galleries, bento grids and photo stacks.",
  Input:
    "Animated React form and input components — pickers, multi-step forms, inline edit and search fields.",
  Layout:
    "React layout components with motion built in: scroll decks, split cards and expanding grids.",
  List: "Animated React list components — stacked lists, carousels and infinite grids.",
  Navigation:
    "Animated React navigation components — tabs, navbars, drawers, toolbars and bottom menus.",
};

export default async function ComponentsIndexPage() {
  const [navItems, githubStars] = await Promise.all([
    getOpenNavItems(),
    getGithubStarCount(),
  ]);

  const categoryBySlug = new Map(
    browseItems.map((item) => [item.slug, item.category]),
  );

  const entries = navItems.map((item) => {
    const docsPage = getComponentDocsPage(item.slug);
    return {
      slug: item.slug,
      title: item.title,
      href: item.href,
      description: docsPage?.data.description ?? "",
      tags: item.tags ?? [],
      category: categoryBySlug.get(item.slug) ?? "Display",
      isNew: item.isNew,
    };
  });

  const categories = Array.from(
    new Set(entries.map((entry) => entry.category)),
  ).sort();

  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <ComponentListJsonLd
        items={entries}
        path="/components"
        name={TITLE}
        description={DESCRIPTION}
      />
      <FaqJsonLd items={FAQ} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Components", path: "/components" },
        ]}
      />

      <LandingNav githubStars={githubStars} />

      <div className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-10 sm:px-8">
        <header className="flex flex-col gap-5 border-b border-[#E2E2E2] pb-10">
          <h1 className="max-w-[760px] text-balance text-[38px] leading-[1.1] tracking-[-0.04em] sm:text-[52px]">
            {entries.length} free animated React components
          </h1>
          {/* 40-60 word answer block: the unit AI engines lift verbatim. */}
          <p className="max-w-[680px] text-pretty text-[17px] leading-relaxed text-[#4B565E]">
            useLayouts is a free, open-source library of animated React
            components built with Motion and Tailwind CSS. Every component is a
            single TypeScript file you copy into your project or install with
            the shadcn CLI. MIT licensed, no sign-up, no runtime dependency.
          </p>
          <div className="flex flex-wrap gap-2.5 font-[family-name:var(--font-geist-mono)] text-[13px] text-[#3D464C]">
            {["React", "Next.js", "TypeScript", "Tailwind CSS", "Motion", "shadcn CLI", "MIT licensed"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white px-2.5 py-1 shadow-[inset_0_0_0_1px_rgba(7,26,49,0.07)]"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/browse"
              className="rounded-full bg-[#071A31] px-5 py-2.5 text-[15px] text-white transition-opacity hover:opacity-90"
            >
              Preview them live
            </Link>
            <Link
              href="/docs"
              className="rounded-full bg-white px-5 py-2.5 text-[15px] text-[#071A31] shadow-[inset_0_0_0_1px_rgba(7,26,49,0.12)] transition-colors hover:bg-[#FAF9F7]"
            >
              Read the docs
            </Link>
          </div>
        </header>

        {/* In-page nav: gives the category H2s internal anchors to rank on. */}
        <nav aria-label="Component categories" className="flex flex-wrap gap-2.5 py-8">
          {categories.map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase()}`}
              className="rounded-full bg-white px-4 py-1.5 text-[14px] text-[#071A31] shadow-[inset_0_0_0_1px_rgba(7,26,49,0.1)] transition-colors hover:bg-[#FAF9F7]"
            >
              {category} ({entries.filter((e) => e.category === category).length})
            </a>
          ))}
        </nav>

        {categories.map((category) => {
          const items = entries
            .filter((entry) => entry.category === category)
            .sort((a, b) => a.title.localeCompare(b.title));
          return (
            <section
              key={category}
              id={category.toLowerCase()}
              className="scroll-mt-24 border-t border-[#E2E2E2] py-10"
            >
              <h2 className="text-[28px] leading-tight tracking-[-0.03em] sm:text-[32px]">
                {category} components
              </h2>
              <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed text-[#4B565E]">
                {CATEGORY_BLURB[category] ??
                  `Animated React ${category.toLowerCase()} components, free to copy.`}
              </p>

              <ul className="mt-7 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li key={item.slug}>
                    <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em]">
                      <Link
                        href={item.href}
                        className="underline decoration-[#071A31]/20 decoration-1 underline-offset-[3px] transition-colors hover:decoration-[#071A31]/60"
                      >
                        {item.title} React component
                      </Link>
                      {item.isNew ? (
                        <span className="ml-2 align-middle font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-[#4B565E]">
                          new
                        </span>
                      ) : null}
                    </h3>
                    {item.description ? (
                      <p className="mt-1.5 text-[14px] leading-relaxed text-[#4B565E]">
                        {item.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="border-t border-[#E2E2E2] py-12">
          <h2 className="text-[28px] leading-tight tracking-[-0.03em] sm:text-[32px]">
            Frequently asked questions
          </h2>
          <dl className="mt-7 flex max-w-[760px] flex-col gap-7">
            {FAQ.map((item) => (
              <div key={item.question}>
                <dt className="text-[17px] font-medium tracking-[-0.01em]">
                  {item.question}
                </dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-[#4B565E]">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
