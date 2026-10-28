import LandingPage from "@/components/landing/landing-page";
import { getGithubStarCount } from "@/lib/github";
import { getLandingCategoryCards } from "@/lib/landing/categories";
import { getLandingHeroItems } from "@/lib/landing/hero-components";
import { getOpenNavItems } from "@/lib/open/component";

/**
 * The homepage read three filesystem configs and the GitHub API on every
 * request, which put TTFB at ~4.6s in production. None of that data changes
 * per visitor, so render it once an hour instead.
 */
export const revalidate = 3600;

export default async function Page() {
  const [heroItems, categoryCards, githubStars, navItems] = await Promise.all([
    getLandingHeroItems(),
    getLandingCategoryCards(),
    getGithubStarCount(),
    getOpenNavItems(),
  ]);
  return (
    <LandingPage
      heroItems={heroItems}
      categoryCards={categoryCards}
      githubStars={githubStars}
      componentCount={navItems.length}
    />
  );
}
