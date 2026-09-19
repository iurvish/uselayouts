import { LandingNav } from "@/components/landing/landing-nav";
import type { ReactNode } from "react";
import { getGithubStarCount } from "@/lib/github";
import { source } from "@/lib/source";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";

export default async function Layout({ children }: { children: ReactNode }) {
  const githubStars = await getGithubStarCount();
  return (
    <TreeContextProvider tree={source.pageTree}>
      <div className="light min-h-svh bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
        <LandingNav githubStars={githubStars} />
        {children}
      </div>
    </TreeContextProvider>
  );
}
