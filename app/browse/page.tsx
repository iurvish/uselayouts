import Link from "next/link";

import { BrowseExperience } from "@/components/browse/browse-experience";
import { ComponentListJsonLd } from "@/components/seo/json-ld";
import { loadComponentTags } from "@/lib/admin/components-fs";
import { browseItems } from "@/lib/browse/items";
import { getCopyStats } from "@/lib/browse/copy-stats";
import { rankComponents } from "@/lib/browse/ranking";
import { getGithubStarCount } from "@/lib/github";

export const revalidate = 3600;

export default async function BrowsePage() {
  const [tags, stars, copyStats] = await Promise.all([
    loadComponentTags(),
    getGithubStarCount(),
    getCopyStats(),
  ]);

  // Ranked here rather than in the client: both the grid and the canvas render
  // whatever order they are handed, and the canvas centres its camera on
  // items[0], so this decides what you actually land on. Copy totals are read
  // once per `revalidate` window rather than per request.
  const items = rankComponents(
    browseItems.map((item) => ({ ...item, tags: tags[item.slug] ?? [] })),
    copyStats,
    (item) => ({ slug: item.slug, title: item.title }),
  );

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
