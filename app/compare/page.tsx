import type { Metadata } from "next";
import Link from "next/link";

import { LandingNav } from "@/components/landing/landing-nav";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { COMPETITORS, USELAYOUTS, VERIFIED_ON } from "@/lib/compare/competitors";
import { getGithubStarCount } from "@/lib/github";
import { absoluteUrl, canonical } from "@/lib/seo/site";

export const revalidate = 86400;

const TITLE = "Free animated React component libraries, compared";
const DESCRIPTION =
  "How useLayouts compares to Magic UI, Aceternity UI, React Bits and shadcn/ui on license, component count and scope. Every figure checked against the libraries' own docs.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | useLayouts` },
  description: DESCRIPTION,
  ...canonical("/compare"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/compare" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

const VERIFIED_LABEL = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
}).format(new Date(VERIFIED_ON));

export default async function CompareIndexPage() {
  const githubStars = await getGithubStarCount();

  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: TITLE,
            numberOfItems: COMPETITORS.length,
            itemListElement: COMPETITORS.map((rival, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `useLayouts vs ${rival.name}`,
              url: absoluteUrl(`/compare/${rival.slug}`),
            })),
          }),
        }}
      />
      <LandingNav githubStars={githubStars} />

      <div className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-10 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-[#E2E2E2] pb-10">
          <h1 className="text-balance text-[34px] leading-[1.12] tracking-[-0.035em] sm:text-[44px]">
            {TITLE}
          </h1>
          <p className="text-pretty text-[17px] leading-relaxed text-[#4B565E]">
            useLayouts is {USELAYOUTS.componentCount} animated React components,
            MIT licensed, free, with no paid tier. Here is how it sits next to
            the other libraries people weigh it against, with the licenses and
            counts read from their own documentation rather than estimated.
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-[13px] text-[#6B757C]">
            Checked {VERIFIED_LABEL}
          </p>
        </header>

        <ul className="flex flex-col divide-y divide-[#E2E2E2]">
          {COMPETITORS.map((rival) => (
            <li key={rival.slug} className="py-8">
              <h2 className="text-[22px] font-medium leading-snug tracking-[-0.02em] sm:text-[25px]">
                <Link
                  href={`/compare/${rival.slug}`}
                  className="underline decoration-[#071A31]/20 decoration-1 underline-offset-[4px] transition-colors hover:decoration-[#071A31]/60"
                >
                  useLayouts vs {rival.name}
                </Link>
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#4B565E]">
                {rival.differences[0]}
              </p>
              <p className="mt-2.5 font-[family-name:var(--font-geist-mono)] text-[13px] text-[#6B757C]">
                {rival.license ?? "License not published"}
                {rival.componentCount ? ` · ${rival.componentCount} components` : ""}
                {rival.githubStars
                  ? ` · ${new Intl.NumberFormat("en-US").format(rival.githubStars)} stars`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
