import LandingPage from "@/components/landing/landing-page";
import { getGithubStarCount } from "@/lib/github";
import { getLandingHeroItems } from "@/lib/landing/hero-components";

export default async function Page() {
  const [heroItems, githubStars] = await Promise.all([
    getLandingHeroItems(),
    getGithubStarCount(),
  ]);
  return <LandingPage heroItems={heroItems} githubStars={githubStars} />;
}
