"use client";

import { useMemo } from "react";

import { useTreeContext } from "fumadocs-ui/contexts/tree";
import { Link, usePathname } from "fumadocs-core/framework";
import type * as PageTree from "fumadocs-core/page-tree";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Footer() {
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
