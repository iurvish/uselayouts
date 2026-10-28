import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/site";

/**
 * Note: Cloudflare also injects a managed robots.txt ahead of this one, and it
 * currently disallows ClaudeBot, GPTBot, Google-Extended, CCBot and others.
 * That block wins over anything declared here, so it has to be turned off in
 * the Cloudflare dashboard (Settings > AI Crawl Control) for AI search
 * discovery to work.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private surfaces; nothing here should ever enter an index.
        disallow: ["/admin", "/admin/", "/api/", "/auth/", "/preview/"],
      },
      // Search and user-triggered retrieval agents, named so a future
      // wildcard tightening cannot silently drop AI discovery.
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "Perplexity-User",
          "Claude-SearchBot",
          "Claude-User",
          "Google-Extended",
          "Applebot",
          "Bingbot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
