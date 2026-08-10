import { DocsSidebar } from "@/components/layout/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";

import SearchDialog from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <TreeContextProvider tree={source.pageTree}>
      <SidebarProvider>
        <DocsSidebar tree={source.pageTree} />
        <SidebarInset>
          <header className="sticky top-0  bg-background h-14 z-priority ">
            <nav className="flex flex-row items-center gap-2 size-full px-4">
              <SidebarTrigger />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <SearchDialog />
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main id="nd-docs-layout" className="flex flex-1 flex-row">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TreeContextProvider>
  );
}
