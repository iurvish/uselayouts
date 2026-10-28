import { blog as blogEntries, docs } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

/**
 * `blog` is a plain `type: "doc"` collection, so it comes back as a flat array
 * of entries with the frontmatter spread on each one. There is no meta file and
 * no page tree to build, so it skips `loader()` and keeps the array.
 */
type BlogEntry = (typeof blogEntries)[number];

export type BlogPost = BlogEntry & { slug: string; url: string };

function toPost(entry: BlogEntry): BlogPost {
  // "animate-card-stack-react.mdx" -> "animate-card-stack-react"
  const slug = entry.info.path.replace(/\.mdx?$/, "");
  return { ...entry, slug, url: `/blog/${slug}` };
}

/** Published posts, newest first. Drafts never leave the content folder. */
export function getPublishedPosts(): BlogPost[] {
  return blogEntries
    .filter((entry) => !entry.draft)
    .map(toPost)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): BlogPost | undefined {
  const entry = blogEntries.find(
    (item) => item.info.path.replace(/\.mdx?$/, "") === slug,
  );
  return entry && !entry.draft ? toPost(entry) : undefined;
}
