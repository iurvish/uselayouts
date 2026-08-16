import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OpenExperience } from "@/components/open/open-experience";
import { getOpenComponent, getOpenNavItems } from "@/lib/open/component";

export default async function OpenComponentPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const [data, navItems] = await Promise.all([
    getOpenComponent(slug),
    getOpenNavItems(),
  ]);
  if (!data) notFound();

  return <OpenExperience data={data} navItems={navItems} />;
}

export async function generateStaticParams() {
  const navItems = await getOpenNavItems();
  return navItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getOpenComponent(slug);
  if (!data) return { title: "Component" };
  return {
    title: data.title,
    description: data.description,
  };
}
