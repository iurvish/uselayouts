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
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <TreeContextProvider tree={source.pageTree}>
      <SidebarProvider>
        <DocsSidebar tree={source.pageTree} />
        <SidebarInset>
          <header className="sticky top-0 z-priority h-14 bg-background">
            <nav className="flex size-full flex-row items-center gap-2 px-4">
              <SidebarTrigger />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                {process.env.NODE_ENV === "development" && (
                  <Link
                    href="/admin"
                    className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline"
                  >
                    Admin
                  </Link>
                )}
                <SearchDialog />
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main id="nd-docs-layout" className="flex w-full min-w-0 flex-1 flex-row overflow-x-clip">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TreeContextProvider>
  );
}
