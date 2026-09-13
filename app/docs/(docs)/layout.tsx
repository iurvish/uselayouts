import { LandingNav } from "@/components/landing/landing-nav";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <TreeContextProvider tree={source.pageTree}>
      <div className="light min-h-svh bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
        <LandingNav />
        {children}
      </div>
    </TreeContextProvider>
  );
}
