import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import defaultMdxComponents from "fumadocs-ui/mdx";

import { LandingNav } from "@/components/landing/landing-nav";
import { OpenMdxPre } from "@/components/open/open-mdx";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getGithubStarCount } from "@/lib/github";
import { SITE_NAME, SITE_URL, absoluteUrl, canonical } from "@/lib/seo/site";
import { getPost, getPublishedPosts } from "@/lib/source";

export const revalidate = 3600;

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export async function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getPost(slug);
  if (!page) return { title: "Not found" };

  const path = `/blog/${slug}`;
  return {
    title: { absolute: `${page.title} | ${SITE_NAME}` },
    description: page.description,
    ...canonical(path),
    authors: [{ name: page.author }],
    openGraph: {
      type: "article",
      title: page.title,
      description: page.description,
      url: path,
      publishedTime: page.date,
      ...(page.updated ? { modifiedTime: page.updated } : {}),
    },
    twitter: { title: page.title, description: page.description },
  };
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const page = getPost(slug);
  if (!page) notFound();

  const MDX = page.body;
  const githubStars = await getGithubStarCount();
  const url = absoluteUrl(`/blog/${slug}`);

  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      {/* Article carries the author and the dates. Freshness is a ranking and
          a citation signal, and an undated post loses to a dated one. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${url}#post`,
            headline: page.title,
            description: page.description,
            url,
            datePublished: page.date,
            dateModified: page.updated ?? page.date,
            inLanguage: "en",
            keywords: page.tags.join(", "),
            author: {
              "@type": "Person",
              name: page.author,
              url: "https://urvish.in",
            },
            publisher: { "@id": `${SITE_URL}/#organization` },
            isPartOf: { "@id": `${SITE_URL}/#website` },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
          }),
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: page.title, path: `/blog/${slug}` },
        ]}
      />
      <LandingNav githubStars={githubStars} />

      <article className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-10 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-[#E2E2E2] pb-8">
          <h1 className="text-balance text-[34px] leading-[1.12] tracking-[-0.035em] sm:text-[44px]">
            {page.title}
          </h1>
          <p className="text-pretty text-[17px] leading-relaxed text-[#4B565E]">
            {page.description}
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-[13px] text-[#6B757C]">
            {page.author}
            {" · "}
            <time dateTime={page.date}>
              {DATE_FORMAT.format(new Date(page.date))}
            </time>
            {page.updated ? (
              <>
                {" · updated "}
                <time dateTime={page.updated}>
                  {DATE_FORMAT.format(new Date(page.updated))}
                </time>
              </>
            ) : null}
          </p>
        </header>

        <div className="prose prose-neutral mt-8 w-full min-w-0 max-w-none text-base leading-7 text-[#4B565E] [&_a]:font-medium [&_a]:text-[#071A31] [&_code]:text-[#071A31] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-28 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#071A31] [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-[#071A31] [&_p]:mt-0 [&_p]:mb-6 [&_pre]:my-0 [&_strong]:text-[#071A31]">
          <MDX
            components={{
              ...defaultMdxComponents,
              pre: (props: React.ComponentPropsWithoutRef<"pre">) => (
                <OpenMdxPre {...props} variant="light" />
              ),
            }}
          />
        </div>

        <footer className="mt-14 border-t border-[#E2E2E2] pt-8">
          <Link
            href="/components"
            className="text-[15px] font-medium text-[#071A31] underline decoration-[#071A31]/25 underline-offset-4"
          >
            Browse all free animated React components
          </Link>
        </footer>
      </article>
    </main>
  );
}
