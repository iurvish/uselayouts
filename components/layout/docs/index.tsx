"use client";
import type * as PageTree from "fumadocs-core/page-tree";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import { cn } from "../../../lib/cn";
import { TreeContextProvider, useTreeContext } from "fumadocs-ui/contexts/tree";
import Link from "fumadocs-core/link";
import { cva } from "class-variance-authority";
import { usePathname } from "fumadocs-core/framework";
import {
  SidebarProvider,
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
} from "@/components/ui/sidebar";
import SearchDialog from "@/components/search-dialog";

export interface DocsLayoutProps {
  tree: PageTree.Root;
  children: ReactNode;
}

export function DocsLayout({ tree, children }: DocsLayoutProps) {
  return (
    <TreeContextProvider tree={tree}>
      <SidebarProvider>
        <ShadcnSidebar variant={"floating"}>
          <SidebarHeader>
            <Link href="/" className="font-medium px-2 py-2">
              My Docs
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <DocsSidebarContent />
          </SidebarContent>
        </ShadcnSidebar>
        <SidebarInset>
          <header className="sticky top-0  h-14 z-20 ">
            <nav className="flex flex-row items-center gap-2 size-full px-4">
              <SidebarTrigger />
              <div className="flex-1" />
              <SearchDialog />
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

function DocsSidebarContent() {
  const { root } = useTreeContext();

  const children = useMemo(() => {
    function renderItems(items: PageTree.Node[], isNested = false): ReactNode {
      return items.map((item) => (
        <SidebarItem key={item.$id} item={item} isNested={isNested}>
          {item.type === "folder" ? renderItems(item.children, true) : null}
        </SidebarItem>
      ));
    }

    return renderItems(root.children, false);
  }, [root]);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>{children}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

const linkVariants = cva("flex items-center gap-2 w-full [&_svg]:size-4", {
  variants: {
    active: {
      true: "text-sidebar-accent-foreground bg-sidebar-accent font-medium",
      false:
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    },
  },
});

function SidebarItem({
  item,
  children,
  isNested = false,
}: {
  item: PageTree.Node;
  children: ReactNode;
  isNested?: boolean;
}) {
  const pathname = usePathname();

  if (item.type === "page") {
    if (isNested) {
      return (
        <SidebarMenuSubItem>
          <SidebarMenuSubButton
            render={(props) => <Link {...props} href={item.url} />}
            isActive={pathname === item.url}
          >
            {item.icon}
            <span>{item.name}</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={(props) => <Link {...props} href={item.url} />}
          isActive={pathname === item.url}
        >
          {item.icon}
          <span>{item.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (item.type === "separator") {
    return (
      <SidebarGroupLabel>
        {item.icon}
        {item.name}
      </SidebarGroupLabel>
    );
  }

  if (isNested) {
    return (
      <SidebarMenuSubItem>
        {item.index ? (
          <SidebarMenuSubButton
            render={(props) => <Link {...props} href={item.index!.url} />}
            isActive={pathname === item.index.url}
          >
            {item.index.icon}
            <span>{item.index.name}</span>
          </SidebarMenuSubButton>
        ) : (
          <SidebarMenuSubButton>
            {item.icon}
            <span>{item.name}</span>
          </SidebarMenuSubButton>
        )}
        {children && <SidebarMenuSub>{children}</SidebarMenuSub>}
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem>
      {item.index ? (
        <SidebarMenuButton
          render={(props) => <Link {...props} href={item.index!.url} />}
          isActive={pathname === item.index.url}
        >
          {item.index.icon}
          <span>{item.index.name}</span>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton>
          {item.icon}
          <span>{item.name}</span>
        </SidebarMenuButton>
      )}
      {children && <SidebarMenuSub>{children}</SidebarMenuSub>}
    </SidebarMenuItem>
  );
}
