import type { MetadataRoute } from "next";

import { getOpenNavItems } from "@/lib/open/component";
import { SITE_URL } from "@/lib/seo/site";
import { source } from "@/lib/source";

export const revalidate = 3600;

/**
 * The previous sitemap listed the homepage plus fumadocs pages and stamped
 * every entry with `new Date()`, so each deploy claimed the whole site had
 * changed. It also left /components, /browse and /sponsor out entirely.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const navItems = await getOpenNavItems();
  const componentSlugs = new Set(navItems.map((item) => item.slug));

  const componentPages = navItems.map((item) => ({
    url: `${SITE_URL}${item.href}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // fumadocs routes that are not one of the component detail pages.
  const docsPages = source
    .getPages()
    .filter((page) => {
      const slug = page.url.split("/").pop();
      return !slug || !componentSlugs.has(slug);
    })
    .map((page) => ({
      url: `${SITE_URL}${page.url}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/components`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${SITE_URL}/browse`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/docs`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/sponsor`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // `source.getPages()` includes the /docs index, which is already listed
  // above, and a repeated <loc> makes the whole sitemap look untrustworthy.
  const seen = new Set<string>();
  return [...staticPages, ...componentPages, ...docsPages].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
