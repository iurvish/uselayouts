/**
 * Single source of truth for the canonical origin and the strings that have to
 * stay identical across metadata, JSON-LD, the sitemap and llms.txt.
 */
export const SITE_URL = "https://uselayouts.com";

export const SITE_NAME = "useLayouts";

export const SITE_TAGLINE =
  "Free animated React components built with Motion and Tailwind CSS";

export const SITE_DESCRIPTION =
  "A free, open-source library of animated React components. Copy the code or install with the shadcn CLI. Built with React, Motion (Framer Motion) and Tailwind CSS, MIT licensed.";

export const TWITTER_HANDLE = "@0xUrvish";

export const GITHUB_URL = "https://github.com/iurvish/uselayouts";

/** Absolute URL for a site-relative path, with no double slashes. */
export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString().replace(/\/$/, path === "/" ? "/" : "");
}

/**
 * Next only emits `<link rel="canonical">` when a route declares one, and a
 * missing canonical is what lets query-string and trailing-slash variants
 * compete with each other. Every route spreads this.
 */
export function canonical(path = "/") {
  return { alternates: { canonical: path } } as const;
}

/**
 * The <title> for one component page. The bare component name ("Wheel
 * Carousel") matches nothing anyone searches, so the framework and the
 * free/animated modifiers carry the query intent.
 *
 * This lives here because the client shell also writes `document.title` during
 * client-side navigation between component pages. When that string was spelled
 * out separately it overwrote the server title with the un-optimised name.
 */
export function componentTitle(name: string) {
  return `${name} — Animated React Component (Free) | ${SITE_NAME}`;
}
