import { LandingNav } from "@/components/landing/landing-nav";
import type { ReactNode } from "react";
import { getGithubStarCount } from "@/lib/github";

export default async function SponsorLayout({ children }: { children: ReactNode }) {
  const githubStars = await getGithubStarCount();
  return (
    <div className="flex min-h-svh flex-col bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31] antialiased">
      <LandingNav githubStars={githubStars} />
      {children}
    </div>
  );
}
