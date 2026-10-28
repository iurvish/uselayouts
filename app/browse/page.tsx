import Link from "next/link";

import { BrowseExperience } from "@/components/browse/browse-experience";
import { ComponentListJsonLd } from "@/components/seo/json-ld";
import { loadComponentTags } from "@/lib/admin/components-fs";
import { browseItems } from "@/lib/browse/items";
import { getGithubStarCount } from "@/lib/github";

export const revalidate = 3600;

export default async function BrowsePage() {
  const [tags, stars] = await Promise.all([
    loadComponentTags(),
    getGithubStarCount(),
  ]);
  const items = browseItems.map((item) => ({
    ...item,
    tags: tags[item.slug] ?? [],
  }));

  return (
    <>
      <ComponentListJsonLd
        items={browseItems}
        path="/browse"
        name="Browse animated React components"
        description="Preview every free animated React component in the useLayouts library."
      />
      {/*
        The gallery is a pointer-driven canvas and rendered zero <a> elements,
        so /browse was a crawl dead end that passed no equity to the 65 detail
        pages. These are the same destinations the cards open.
      */}
      <nav className="sr-only" aria-label="All components">
        <h1>Browse free animated React components</h1>
        <ul>
          {browseItems.map((item) => (
            <li key={item.slug}>
              <Link href={`/docs/components/${item.slug}`}>
                {item.title} React component
              </Link>
              {item.description ? ` — ${item.description}` : null}
            </li>
          ))}
        </ul>
        <Link href="/components">All components with descriptions</Link>
      </nav>
      <BrowseExperience items={items} stars={stars} />
    </>
  );
}
