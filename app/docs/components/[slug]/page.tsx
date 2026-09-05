import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OpenComponentView } from "@/components/open/open-component-view";
import { getOpenMdxComponents } from "@/components/open/open-mdx";
import {
  getComponentDocsPage,
  getOpenComponent,
  getOpenNavItems,
} from "@/lib/open/component";

export default async function OpenComponentPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const data = await getOpenComponent(slug);
  if (!data) notFound();

  const docsPage = getComponentDocsPage(slug);
  const MDX = docsPage?.data.body;
  const docsContent = MDX ? <MDX components={getOpenMdxComponents()} /> : null;

  return <OpenComponentView data={data} docsContent={docsContent} />;
}

export async function generateStaticParams() {
  const navItems = await getOpenNavItems();
  return navItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const docsPage = getComponentDocsPage(slug);
  if (docsPage) {
    return {
      title: docsPage.data.title,
      description: docsPage.data.description,
    };
  }
  const data = await getOpenComponent(slug);
  if (!data) return { title: "Component" };
  return {
    title: data.title,
    description: data.description,
  };
}
