import { LandingNav } from "@/components/landing/landing-nav";
import type { ReactNode } from "react";

export default function SponsorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31] antialiased">
      <LandingNav />
      {children}
    </div>
  );
}
