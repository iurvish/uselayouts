import LandingPage from "@/components/landing/landing-page";
import { getLandingHeroItems } from "@/lib/landing/hero-components";

export default async function Page() {
  const heroItems = await getLandingHeroItems();
  return <LandingPage heroItems={heroItems} />;
}
