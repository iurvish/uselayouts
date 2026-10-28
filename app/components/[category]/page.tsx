import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LandingNav } from "@/components/landing/landing-nav";
import {
  BreadcrumbJsonLd,
  ComponentListJsonLd,
  FaqJsonLd,
} from "@/components/seo/json-ld";
import { getComponentDocsPage, getOpenNavItems } from "@/lib/open/component";
import { getGithubStarCount } from "@/lib/github";
import {
  COMPONENT_CATEGORIES,
  categoryComponents,
  findCategory,
} from "@/lib/seo/categories";
import { canonical } from "@/lib/seo/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return COMPONENT_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = findCategory(slug);
  if (!category) return {};

  const path = `/components/${category.slug}`;
  return {
    title: { absolute: `${category.title} | useLayouts` },
    description: category.metaDescription,
    ...canonical(path),
    openGraph: {
      title: category.title,
      description: category.metaDescription,
      url: path,
    },
    twitter: {
      title: category.title,
      description: category.metaDescription,
    },
  };
}

export default async function ComponentCategoryPage(props: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await props.params;
  const category = findCategory(slug);
  if (!category) notFound();

  const [navItems, githubStars] = await Promise.all([
    getOpenNavItems(),
    getGithubStarCount(),
  ]);

  const items = categoryComponents(category, navItems).map((item) => ({
    slug: item.slug,
    title: item.title,
    href: item.href,
    description: getComponentDocsPage(item.slug)?.data.description ?? "",
    isNew: item.isNew,
  }));

  const siblings = COMPONENT_CATEGORIES.filter(
    (entry) => entry.slug !== category.slug,
  );

  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <ComponentListJsonLd
        items={items}
        path={`/components/${category.slug}`}
        name={category.heading}
        description={category.metaDescription}
      />
      <FaqJsonLd items={category.faq} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Components", path: "/components" },
          { name: category.heading, path: `/components/${category.slug}` },
        ]}
      />

      <LandingNav githubStars={githubStars} />

      <div className="mx-auto w-full max-w-[1100px] px-4 pt-10 pb-24 sm:px-8">
        <nav
          aria-label="Breadcrumb"
          className="font-[family-name:var(--font-geist-mono)] text-[13px] text-[#4B565E]"
        >
          <Link href="/components" className="underline underline-offset-2">
            All components
          </Link>
          <span aria-hidden> / </span>
          <span>{category.slug}</span>
        </nav>

        <header className="mt-6 flex flex-col gap-5 border-b border-[#E2E2E2] pb-10">
          {/* Only the first character drops case — `toLowerCase()` on the whole
              heading also lowercased "React". */}
          <h1 className="max-w-[760px] text-balance text-[38px] leading-[1.1] tracking-[-0.04em] sm:text-[52px]">
            {items.length} {category.heading[0].toLowerCase()}
            {category.heading.slice(1)}
          </h1>
          {/* 40-60 word answer block: the unit AI engines lift verbatim. */}
          <p className="max-w-[680px] text-pretty text-[17px] leading-relaxed text-[#4B565E]">
            {category.summary}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/browse"
              className="rounded-full bg-[#071A31] px-5 py-2.5 text-[15px] text-white transition-opacity hover:opacity-90"
            >
              Preview them live
            </Link>
            <Link
              href="/components"
              className="rounded-full bg-white px-5 py-2.5 text-[15px] text-[#071A31] shadow-[inset_0_0_0_1px_rgba(7,26,49,0.12)] transition-colors hover:bg-[#FAF9F7]"
            >
              All {navItems.length} components
            </Link>
          </div>
        </header>

        <section className="border-b border-[#E2E2E2] py-10">
          <h2 className="text-[28px] leading-tight tracking-[-0.03em] sm:text-[32px]">
            All {category.shortName}
          </h2>
          <ul className="mt-7 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.slug}>
                <h3 className="text-[17px] leading-snug font-medium tracking-[-0.01em]">
                  <Link
                    href={item.href}
                    className="underline decoration-[#071A31]/20 decoration-1 underline-offset-[3px] transition-colors hover:decoration-[#071A31]/60"
                  >
                    {item.title} React component
                  </Link>
                  {item.isNew ? (
                    <span className="ml-2 align-middle font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide uppercase text-[#4B565E]">
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

        {/* The prose the ranking competitors have and a bare grid does not. */}
        {category.sections.map((section) => (
          <section
            key={section.heading}
            className="border-b border-[#E2E2E2] py-10"
          >
            <h2 className="max-w-[760px] text-balance text-[28px] leading-tight tracking-[-0.03em] sm:text-[32px]">
              {section.heading}
            </h2>
            <p className="mt-4 max-w-[680px] text-[16px] leading-relaxed text-[#4B565E]">
              {section.body}
            </p>
          </section>
        ))}

        <section className="border-b border-[#E2E2E2] py-12">
          <h2 className="text-[28px] leading-tight tracking-[-0.03em] sm:text-[32px]">
            Frequently asked questions
          </h2>
          <dl className="mt-7 flex max-w-[760px] flex-col gap-7">
            {category.faq.map((item) => (
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

        <section className="py-12">
          <h2 className="text-[28px] leading-tight tracking-[-0.03em] sm:text-[32px]">
            Other component categories
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {siblings.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/components/${entry.slug}`}
                  className="inline-block rounded-full bg-white px-4 py-1.5 text-[14px] text-[#071A31] shadow-[inset_0_0_0_1px_rgba(7,26,49,0.1)] transition-colors hover:bg-[#FAF9F7]"
                >
                  {entry.heading}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
