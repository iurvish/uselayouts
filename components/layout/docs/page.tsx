"use client";

import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import {
  AnchorProvider,
  type TOCItemType,
  useActiveAnchors,
} from "fumadocs-core/toc";
import { cn } from "../../../lib/cn";
import { useTreeContext } from "fumadocs-ui/contexts/tree";
import { Link, usePathname } from "fumadocs-core/framework";
import type * as PageTree from "fumadocs-core/page-tree";
import { InlineTOC } from "@/components/inline-toc";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export interface DocsPageProps {
  toc?: TOCItemType[];

  children: ReactNode;
}

// Sticky glass TOC component
function StickyTOC({ toc }: { toc: TOCItemType[] }) {
  const activeAnchors = useActiveAnchors();

  // Find the current active section title
  const activeItem = useMemo(() => {
    if (activeAnchors.length === 0) return undefined;
    // Use the first active anchor to show the current section
    const firstActiveAnchor = activeAnchors[0];
    return toc.find((item) => item.url === `#${firstActiveAnchor}`);
  }, [activeAnchors, toc]);

  if (toc.length === 0) return null;

  return (
    <div className="sticky top-14 z-10 xl:hidden z-priority">
      <InlineTOC items={toc}>{activeItem?.title || "On this page"}</InlineTOC>
    </div>
  );
}

export function DocsPage({ toc = [], ...props }: DocsPageProps) {
  return (
    <AnchorProvider toc={toc}>
      {toc.length > 0 && (
        <div className="sticky top-14 shrink-0 h-[calc(100dvh-3.5rem)] pt-8 pb-4 pr-4 overflow-y-auto max-xl:hidden xl:order-last">
          <p className="text-sm text-fd-muted-foreground mb-2 px-2">
            On this page
          </p>
          <div className="flex flex-col">
            {toc.map((item) => (
              <TocItem key={item.url} item={item} />
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <StickyTOC toc={toc} />
        <main className="flex w-full min-w-0 flex-col flex-1">
          <article className="flex flex-1 flex-col w-full max-w-[860px] gap-6 px-4 py-8 md:px-6 md:mx-auto min-w-0">
            {props.children}
            <Footer />
          </article>
        </main>
      </div>
    </AnchorProvider>
  );
}

export function DocsBody(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("", props.className)}>
      {props.children}
    </div>
  );
}

export function DocsDescription(props: ComponentProps<"p">) {
  // don't render if no description provided
  if (props.children === undefined) return null;

  return (
    <p
      {...props}
      className={cn("mb-8 text-lg text-fd-muted-foreground", props.className)}
    >
      {props.children}
    </p>
  );
}

export function DocsTitle(props: ComponentProps<"h1">) {
  return (
    <h1 {...props} className={cn("text-3xl font-semibold", props.className)}>
      {props.children}
    </h1>
  );
}

function TocItem({ item }: { item: TOCItemType }) {
  const activeAnchors = useActiveAnchors();
  const isActive = activeAnchors.includes(item.url.split("#")[1]);

  return (
    <a
      href={item.url}
      className={cn(
        "text-sm text-fd-muted-foreground py-1.5 px-2 rounded-md transition-colors hover:text-fd-foreground",
        isActive && "text-fd-primary font-medium bg-fd-primary/5",
      )}
      style={{
        paddingLeft: Math.max(8, (item.depth - 2) * 16 + 8),
      }}
    >
      {item.title}
    </a>
  );
}

function Footer() {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const flatten = useMemo(() => {
    const result: PageTree.Item[] = [];

    function scan(items: PageTree.Node[]) {
      for (const item of items) {
        if (item.type === "page") result.push(item);
        else if (item.type === "folder") {
          if (item.index) result.push(item.index);
          scan(item.children);
        }
      }
    }

    scan(root.children);
    return result;
  }, [root]);

  const { previous, next } = useMemo(() => {
    const idx = flatten.findIndex((item) => item.url === pathname);

    if (idx === -1) return {};
    return {
      previous: flatten[idx - 1],
      next: flatten[idx + 1],
    };
  }, [flatten, pathname]);

  return (
    <div className="flex flex-row justify-between pt-12 mt-12 border-t border-fd-border">
      {previous ? (
        <Link
          href={previous.url}
          className="group flex flex-row items-center gap-1.5 text-fd-muted-foreground hover:text-fd-foreground transition-colors font-medium"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
          />
          <span>{previous.name}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.url}
          className="group flex flex-row items-center gap-1.5 text-fd-muted-foreground hover:text-fd-foreground transition-colors font-medium text-right"
        >
          <span>{next.name}</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
