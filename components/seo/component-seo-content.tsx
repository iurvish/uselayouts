import Link from "next/link";

import type { OpenNavItem } from "@/lib/open/component";
import { cliInstallCommand } from "@/lib/open/package-manager";
import type { ComponentCategory } from "@/lib/seo/categories";

/**
 * The component pages used to server-render nothing but an interactive preview:
 * no <h1>, no prose, and the docs text lived inside a drawer that mounts on
 * open, so it reached the HTML as RSC payload only. A crawler saw 14 words.
 *
 * This is that text, visible and in the document. It sits below the preview
 * hero so the page reads preview-first and still has something to rank.
 */
export function ComponentSeoContent({
  title,
  description,
  slug,
  dependencies,
  registryItem,
  related,
  docsContent,
  category,
}: {
  title: string;
  description: string;
  slug: string;
  dependencies?: string[];
  registryItem?: string;
  related: OpenNavItem[];
  docsContent?: React.ReactNode;
  /** Links up to the category page, so the hierarchy is crawlable both ways. */
  category?: ComponentCategory;
}) {
  return (
    <article className="border-t border-white/8 bg-[hsl(240_6%_7%)] px-6 py-16 text-foreground md:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-12">
        <header className="flex flex-col gap-3">
          {/* The bare name ranks for nothing. "<name> React component" is
              both the query and a natural reading of the heading. */}
          <h1 className="text-balance text-3xl font-medium tracking-[-0.5px] text-white sm:text-4xl">
            {title} React component
          </h1>
          <p className="text-lg leading-[1.6] text-[hsl(240_5%_65%)]">
            {description}
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-medium tracking-[-0.2px] text-white">
            Installation
          </h2>
          {registryItem ? (
            /* Static and server-rendered on purpose — the interactive
               package-manager tabs live in the code drawer. */
            <pre className="overflow-x-auto rounded-xl border border-white/8 bg-[hsl(240_5%_12%)] px-4 py-3">
              <code className="font-mono text-sm text-white">
                {cliInstallCommand("npm", registryItem)}
              </code>
            </pre>
          ) : (
            <p className="text-[hsl(240_5%_65%)]">
              Open the code panel above and copy{" "}
              <code className="rounded bg-white/8 px-1.5 py-0.5 text-[0.9em] text-white">
                {slug}.tsx
              </code>{" "}
              into your project.
            </p>
          )}
          <p className="text-[hsl(240_5%_65%)]">
            Or copy{" "}
            <code className="rounded bg-white/8 px-1.5 py-0.5 text-[0.9em] text-white">
              {slug}.tsx
            </code>{" "}
            straight out of the code panel. You own the file after that — there
            is no package to add and nothing to keep updated.
          </p>
        </section>

        {dependencies?.length ? (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-medium tracking-[-0.2px] text-white">
              Dependencies
            </h2>
            <ul className="flex flex-wrap gap-2">
              {dependencies.map((dependency) => (
                <li
                  key={dependency}
                  className="rounded-lg bg-white/8 px-2.5 py-1 font-mono text-sm text-white"
                >
                  {dependency}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* The hand-written MDX — Usage, Features, Props. The real content. */}
        {docsContent ? (
          <section className="flex flex-col gap-4">{docsContent}</section>
        ) : null}

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-medium tracking-[-0.2px] text-white">
            Is {title} free to use?
          </h2>
          <p className="text-[hsl(240_5%_65%)]">
            Yes. Every component in the useLayouts library is MIT licensed and
            free for personal and commercial projects, with no attribution
            required and no sign-up to copy the code.
          </p>
        </section>

        {related.length ? (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-medium tracking-[-0.2px] text-white">
              Related components
            </h2>
            <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    className="text-[hsl(240_5%_78%)] underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="flex flex-wrap gap-x-5 gap-y-2 text-[hsl(240_5%_65%)]">
          {category ? (
            <Link
              href={`/components/${category.slug}`}
              className="text-white underline decoration-white/30 underline-offset-4"
            >
              All {category.shortName}
            </Link>
          ) : null}
          <Link
            href="/components"
            className="text-white underline decoration-white/30 underline-offset-4"
          >
            Browse all free animated React components
          </Link>
        </p>
      </div>
    </article>
  );
}
