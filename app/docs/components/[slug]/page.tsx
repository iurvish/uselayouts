import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OpenComponentView } from "@/components/open/open-component-view";
import { getOpenMdxComponents } from "@/components/open/open-mdx";
import { BreadcrumbJsonLd, ComponentJsonLd } from "@/components/seo/json-ld";
import { ComponentSeoContent } from "@/components/seo/component-seo-content";
import {
  getComponentDocsPage,
  getOpenComponent,
  getOpenNavItems,
} from "@/lib/open/component";
import { canonical } from "@/lib/seo/site";

/**
 * These 65 pages are the long-tail of the whole site. `force-dynamic` re-ran
 * them per request (2.2s TTFB) even though `generateStaticParams` already
 * enumerates every slug. Rebuild hourly instead.
 */
export const revalidate = 3600;

export default async function OpenComponentPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const data = await getOpenComponent(slug);
  if (!data) notFound();

  const docsPage = getComponentDocsPage(slug);
  const MDX = docsPage?.data.body;
  const docsContent = MDX ? (
    <MDX components={getOpenMdxComponents()} />
  ) : null;

  const navItems = await getOpenNavItems();
  const index = navItems.findIndex((item) => item.slug === slug);
  // Siblings in nav order, wrapping, so every page links out to six others.
  const related =
    index === -1
      ? navItems.slice(0, 6)
      : Array.from({ length: 6 }, (_, offset) => {
          return navItems[(index + offset + 1) % navItems.length];
        }).filter((item): item is (typeof navItems)[number] =>
          Boolean(item) && item.slug !== slug,
        );

  const description = docsPage?.data.description ?? data.description;

  return (
    <>
      <ComponentJsonLd
        title={data.title}
        description={description}
        slug={slug}
        dependencies={data.dependencies}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Components", path: "/components" },
          { name: data.title, path: `/docs/components/${slug}` },
        ]}
      />
      <OpenComponentView
        data={data}
        seoContent={
          <ComponentSeoContent
            title={data.title}
            description={description}
            slug={slug}
            dependencies={data.dependencies}
            registryItem={data.registryItem}
            related={related}
            docsContent={docsContent}
          />
        }
      />
    </>
  );
}

export async function generateStaticParams() {
  const navItems = await getOpenNavItems();
  return navItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const path = `/docs/components/${slug}`;
  const docsPage = getComponentDocsPage(slug);
  const data = await getOpenComponent(slug);

  const name = docsPage?.data.title ?? data?.title;
  if (!name) return { title: "Component", ...canonical(path) };

  const description = docsPage?.data.description ?? data?.description ?? "";

  // The bare component name ("Wheel Carousel") matches nothing anyone searches.
  // Qualify it with the framework and the free/animated modifiers that carry
  // the volume, and keep the whole thing inside the ~60 char display limit.
  const title = `${name} — Animated React Component (Free)`;
  const metaDescription = `${description} Free React + Tailwind CSS component. Copy the code or install with the shadcn CLI. MIT licensed.`;

  return {
    title: { absolute: `${title} | useLayouts` },
    description: metaDescription.slice(0, 158),
    ...canonical(path),
    openGraph: { title, description: metaDescription.slice(0, 158), url: path },
    twitter: { title, description: metaDescription.slice(0, 158) },
  };
}
