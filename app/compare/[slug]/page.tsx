import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LandingNav } from "@/components/landing/landing-nav";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import {
  COMPETITORS,
  USELAYOUTS,
  VERIFIED_ON,
  getCompetitor,
  type Competitor,
} from "@/lib/compare/competitors";
import { getGithubStarCount } from "@/lib/github";
import { canonical } from "@/lib/seo/site";

export const revalidate = 86400;

export function generateStaticParams() {
  return COMPETITORS.map((competitor) => ({ slug: competitor.slug }));
}

const VERIFIED_LABEL = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
}).format(new Date(VERIFIED_ON));

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const rival = getCompetitor(slug);
  if (!rival) return { title: "Not found" };

  const path = `/compare/${slug}`;
  // Carries both query shapes people actually type: "useLayouts vs X" and
  // "X alternatives".
  const title = `useLayouts vs ${rival.name}: an honest comparison`;
  const description = `How useLayouts and ${rival.name} differ on license, component count and scope, with the numbers checked in ${VERIFIED_LABEL}. Both are free React component libraries.`;

  return {
    title: { absolute: `${title} | useLayouts` },
    description,
    ...canonical(path),
    openGraph: { title, description, url: path },
    twitter: { title, description },
  };
}

function numberFormat(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function faqFor(rival: Competitor) {
  const items = [
    {
      question: `Is useLayouts a good ${rival.name} alternative?`,
      answer: `It depends on what you need. ${rival.differences[0]} Both are free to use.`,
    },
    {
      question: `Can I use useLayouts and ${rival.name} together?`,
      answer: `Yes. Both distribute plain React source files you copy into your own project, so nothing conflicts at the dependency level. Watch the licenses if you redistribute anything.`,
    },
    {
      question: `What license is ${rival.name}?`,
      answer:
        rival.licenseNote ??
        (rival.license
          ? `${rival.name} is ${rival.license} licensed, verified in ${VERIFIED_LABEL}.`
          : `${rival.name} does not publish license terms we could verify.`),
    },
    {
      question: "What license is useLayouts?",
      answer:
        "MIT, with no additional conditions. You can use, modify, redistribute and sell work built with the components, and no attribution is required.",
    },
  ];
  return items;
}

export default async function ComparePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const rival = getCompetitor(slug);
  if (!rival) notFound();

  const githubStars = await getGithubStarCount();
  const faq = faqFor(rival);

  const rows: { label: string; ours: string; theirs: string }[] = [
    {
      label: "Components",
      ours: String(USELAYOUTS.componentCount),
      theirs: rival.componentCount
        ? String(rival.componentCount)
        : (rival.componentCountNote ?? "Not comparable"),
    },
    {
      label: "License",
      ours: "MIT",
      theirs: rival.license ?? "Not published",
    },
    {
      label: "GitHub stars",
      ours: numberFormat(USELAYOUTS.githubStars),
      theirs: rival.githubStars ? numberFormat(rival.githubStars) : "No public repo",
    },
    {
      label: "Animation library",
      ours: "Motion",
      theirs: rival.stack.filter((item) => item !== "React").join(", "),
    },
    { label: "Install", ours: "shadcn CLI or copy", theirs: rival.install.join(" or ") },
    {
      label: "Paid tier",
      ours: "None",
      theirs: rival.hasPaidTier ? "Yes" : "None",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <FaqJsonLd items={faq} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
          { name: `vs ${rival.name}`, path: `/compare/${slug}` },
        ]}
      />
      <LandingNav githubStars={githubStars} />

      <div className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-10 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-[#E2E2E2] pb-10">
          <h1 className="text-balance text-[34px] leading-[1.12] tracking-[-0.035em] sm:text-[44px]">
            useLayouts vs {rival.name}
          </h1>
          {/* Answer block: self-contained, ~50 words, the unit AI engines lift. */}
          <p className="text-pretty text-[17px] leading-relaxed text-[#4B565E]">
            Both are free React component libraries built on Tailwind CSS.{" "}
            {rival.name} describes itself as: {rival.positioning} useLayouts is{" "}
            {USELAYOUTS.componentCount} animated components, MIT licensed, with
            no paid tier. The practical differences are license, scope and size.
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-[13px] text-[#6B757C]">
            Figures below checked {VERIFIED_LABEL} against{" "}
            {rival.name}&apos;s own documentation and the GitHub API.
          </p>
        </header>

        <section className="border-b border-[#E2E2E2] py-10">
          <h2 className="text-[26px] leading-tight tracking-[-0.03em] sm:text-[30px]">
            Side by side
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-[#E2E2E2]">
                  <th scope="col" className="py-3 pr-4 font-medium">
                    &nbsp;
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    useLayouts
                  </th>
                  <th scope="col" className="py-3 font-medium">
                    {rival.name}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[#4B565E]">
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-[#E2E2E2]/70">
                    <th
                      scope="row"
                      className="py-3 pr-4 align-top font-medium text-[#071A31]"
                    >
                      {row.label}
                    </th>
                    <td className="py-3 pr-4 align-top">{row.ours}</td>
                    <td className="py-3 align-top">{row.theirs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rival.componentCountNote && rival.componentCount ? (
            <p className="mt-4 text-[13px] leading-relaxed text-[#6B757C]">
              {rival.name} count is {rival.componentCountNote}.
            </p>
          ) : null}
        </section>

        <section className="border-b border-[#E2E2E2] py-10">
          <h2 className="text-[26px] leading-tight tracking-[-0.03em] sm:text-[30px]">
            Where they actually differ
          </h2>
          <ul className="mt-6 flex flex-col gap-5">
            {rival.differences.map((difference) => (
              <li
                key={difference}
                className="text-[15px] leading-relaxed text-[#4B565E]"
              >
                {difference}
              </li>
            ))}
          </ul>
          {rival.licenseNote ? (
            <div className="mt-7 rounded-xl border border-[#E2E2E2] bg-white p-5">
              <h3 className="text-[16px] font-medium">On the license</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#4B565E]">
                {rival.licenseNote}
              </p>
            </div>
          ) : null}
        </section>

        {/* A comparison that never recommends the rival reads as marketing and
            gets discounted. These are real cases where they win. */}
        <section className="border-b border-[#E2E2E2] py-10">
          <h2 className="text-[26px] leading-tight tracking-[-0.03em] sm:text-[30px]">
            When to pick {rival.name} instead
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {rival.chooseThemWhen.map((reason) => (
              <li
                key={reason}
                className="text-[15px] leading-relaxed text-[#4B565E]"
              >
                {reason}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] leading-relaxed text-[#4B565E]">
            <a
              href={rival.url}
              rel="noopener"
              className="font-medium text-[#071A31] underline decoration-[#071A31]/25 underline-offset-4"
            >
              Visit {rival.name}
            </a>
          </p>
        </section>

        <section className="border-b border-[#E2E2E2] py-10">
          <h2 className="text-[26px] leading-tight tracking-[-0.03em] sm:text-[30px]">
            Frequently asked questions
          </h2>
          <dl className="mt-6 flex flex-col gap-6">
            {faq.map((item) => (
              <div key={item.question}>
                <dt className="text-[16px] font-medium">{item.question}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-[#4B565E]">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="py-10">
          <h2 className="text-[26px] leading-tight tracking-[-0.03em] sm:text-[30px]">
            Sources
          </h2>
          <ul className="mt-5 flex flex-col gap-2 font-[family-name:var(--font-geist-mono)] text-[13px]">
            {rival.sources.map((source) => (
              <li key={source}>
                <a
                  href={source}
                  rel="noopener nofollow"
                  className="break-all text-[#4B565E] underline decoration-[#071A31]/20 underline-offset-2"
                >
                  {source}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[15px]">
            <Link
              href="/components"
              className="font-medium text-[#071A31] underline decoration-[#071A31]/25 underline-offset-4"
            >
              Browse the {USELAYOUTS.componentCount} useLayouts components
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
