import type { ReactNode } from "react";

import { OpenExperience } from "@/components/open/open-experience";
import { getOpenNavItems } from "@/lib/open/component";

export default async function OpenLayout({ children }: { children: ReactNode }) {
  const navItems = await getOpenNavItems();
  return <OpenExperience navItems={navItems}>{children}</OpenExperience>;
}
