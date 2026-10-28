import type { Metadata } from "next";
import Link from "next/link";

import { LandingNav } from "@/components/landing/landing-nav";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getGithubStarCount } from "@/lib/github";
import { canonical } from "@/lib/seo/site";
import { getPublishedPosts } from "@/lib/source";

export const revalidate = 3600;

const TITLE = "React animation guides";
const DESCRIPTION =
  "Guides on animating React interfaces with Motion and Tailwind CSS, written from the components in the useLayouts library.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | useLayouts` },
  description: DESCRIPTION,
  ...canonical("/blog"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/blog" },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default async function BlogIndexPage() {
  const [posts, githubStars] = await Promise.all([
    Promise.resolve(getPublishedPosts()),
    getGithubStarCount(),
  ]);

  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <LandingNav githubStars={githubStars} />

      <div className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-10 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-[#E2E2E2] pb-10">
          <h1 className="text-balance text-[38px] leading-[1.1] tracking-[-0.04em] sm:text-[48px]">
            {TITLE}
          </h1>
          <p className="max-w-[620px] text-pretty text-[17px] leading-relaxed text-[#4B565E]">
            {DESCRIPTION}
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="py-16 text-[#4B565E]">Nothing published yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[#E2E2E2]">
            {posts.map((post) => (
              <li key={post.url} className="py-8">
                <article className="flex flex-col gap-2">
                  <h2 className="text-[22px] font-medium leading-snug tracking-[-0.02em] sm:text-[26px]">
                    <Link
                      href={post.url}
                      className="underline decoration-[#071A31]/20 decoration-1 underline-offset-[4px] transition-colors hover:decoration-[#071A31]/60"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[#4B565E]">
                    {post.description}
                  </p>
                  <time
                    dateTime={post.date}
                    className="font-[family-name:var(--font-geist-mono)] text-[13px] text-[#6B757C]"
                  >
                    {DATE_FORMAT.format(new Date(post.date))}
                  </time>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
