import { defineCollections, defineDocs, defineConfig, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
});

/**
 * Blog posts. Separate collection from `docs` so they get their own loader and
 * route, and so a post's frontmatter can carry the dates and author that
 * Article schema and the RSS feed need.
 */
export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    description: z.string(),
    // ISO date. Freshness is a ranking and citation signal, so it is required.
    date: z.string().date(),
    updated: z.string().date().optional(),
    author: z.string().default("Urvish Mali"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export default defineConfig();
