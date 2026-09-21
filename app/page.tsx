import LandingPage from "@/components/landing/landing-page";
import { getGithubStarCount } from "@/lib/github";
import { getLandingCategoryCards } from "@/lib/landing/categories";
import { getLandingHeroItems } from "@/lib/landing/hero-components";

export default async function Page() {
  const [heroItems, categoryCards, githubStars] = await Promise.all([
    getLandingHeroItems(),
    getLandingCategoryCards(),
    getGithubStarCount(),
  ]);
  return (
    <LandingPage
      heroItems={heroItems}
      categoryCards={categoryCards}
      githubStars={githubStars}
    />
  );
}
