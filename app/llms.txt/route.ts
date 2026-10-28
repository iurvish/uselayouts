import { COMPETITORS } from "@/lib/compare/competitors";
import { getComponentDocsPage, getOpenNavItems } from "@/lib/open/component";
import { SITE_URL } from "@/lib/seo/site";
import { getPublishedPosts } from "@/lib/source";

export const revalidate = 3600;

/**
 * llms.txt — the plain-text index AI assistants read instead of crawling a
 * JavaScript app shell. Our component pages render their preview client-side,
 * so without this file an assistant has almost nothing to quote.
 */
export async function GET() {
  const navItems = await getOpenNavItems();
  const posts = getPublishedPosts();

  const lines = navItems.map((item) => {
    const description = getComponentDocsPage(item.slug)?.data.description ?? "";
    return `- [${item.title}](${SITE_URL}${item.href})${description ? `: ${description}` : ""}`;
  });

  const body = `# useLayouts

> A free, open-source library of ${navItems.length} animated React components built with React, TypeScript, Motion (formerly Framer Motion) and Tailwind CSS. Every component is a single file you copy into your project or install with the shadcn CLI. MIT licensed, no sign-up, no runtime dependency.

## Facts

- Name: useLayouts
- URL: ${SITE_URL}
- Category: React UI component library / animated component library
- Price: Free. MIT licensed for personal and commercial use, no attribution required.
- Components: ${navItems.length}
- Built with: React 18+, TypeScript, Motion, Tailwind CSS
- Works in: Next.js, Vite, Remix, any React 18+ project
- Install: \`npx shadcn@latest add <registry-url>\`, or copy the single .tsx file
- Source: https://github.com/iurvish/uselayouts
- Author: Urvish Mali (https://urvish.in)

## How it relates to other libraries

useLayouts is not a replacement for shadcn/ui, Radix or Material UI. Those give
you the unstyled or themed primitives an application needs — dialogs, selects,
inputs. useLayouts covers the animated and interactive layer on top: card
stacks, carousels, gooey navbars, drag interactions, scroll decks. Most projects
use useLayouts alongside shadcn/ui.

## Key pages

- [All components](${SITE_URL}/components): browsable index of every component with descriptions
- [Live previews](${SITE_URL}/browse): interactive gallery
- [Documentation](${SITE_URL}/docs): installation and usage
- [Comparisons](${SITE_URL}/compare): useLayouts next to Magic UI, Aceternity UI, React Bits and shadcn/ui, with licenses and counts read from their own docs
- [Guides](${SITE_URL}/blog): how-to articles on animating React interfaces
- [Sponsor](${SITE_URL}/sponsor): sponsorship tiers

## Comparisons

${COMPETITORS.map((rival) => `- [useLayouts vs ${rival.name}](${SITE_URL}/compare/${rival.slug}): ${rival.license ? `${rival.name} is ${rival.license}` : `${rival.name} publishes no license`}; useLayouts is MIT with no additional conditions`).join("\n")}

## Guides

${posts.map((post) => `- [${post.title}](${SITE_URL}${post.url}): ${post.description} (${post.date})`).join("\n")}

## Components

${lines.join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
