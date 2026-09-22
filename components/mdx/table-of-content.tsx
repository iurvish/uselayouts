// Component taken from @shadcn official repo and modified by evilcharts

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { TocIndicator } from "./toc-indicator";
import { cn } from "@/lib/utils";
import * as React from "react";

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(
    () => itemIds[0] ?? null,
  );

  React.useEffect(() => {
    if (!itemIds.length) {
      setActiveId(null);
      return;
    }

    const update = () => {
      // Pin first section at page top — IntersectionObserver misses headings here.
      if (window.scrollY < 64) {
        setActiveId(itemIds[0]);
        return;
      }

      const marker = window.innerHeight * 0.25;
      let current = itemIds[0];
      for (const id of itemIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= marker) {
          current = id;
        }
      }
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [itemIds]);

  return activeId;
}

export function DocsTableOfContents({
  toc,
  variant = "list",
  className,
  indicatorClassName,
  indicatorActivePathColor,
  indicatorAirplaneFill,
}: {
  toc: {
    title?: React.ReactNode;
    url: string;
    depth: number;
  }[];
  variant?: "dropdown" | "list";
  className?: string;
  indicatorClassName?: string;
  indicatorActivePathColor?: string;
  indicatorAirplaneFill?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const itemIds = React.useMemo(
    () => toc.map((item) => item.url.replace("#", "")),
    [toc],
  );
  const activeHeading = useActiveItem(itemIds);
  const activeIndex = activeHeading
    ? Math.max(0, itemIds.indexOf(activeHeading))
    : 0;

  if (!toc?.length) {
    return null;
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 md:h-7", className)}
          >
            On This Page
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="no-scrollbar max-h-[70svh]"
        >
          {toc.map((item) => (
            <DropdownMenuItem
              key={item.url}
              onClick={() => {
                setOpen(false);
              }}
              data-depth={item.depth}
              className="data-[depth=3]:pl-6 data-[depth=4]:pl-8"
            >
              <a href={item.url}>{item.title}</a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex flex-col overflow-visible px-0 pt-0 text-base", className)}>
      <div className="flex h-8 flex-row items-center gap-2 pl-1">
        <HugeiconsIcon
          size="16"
          className="text-muted-foreground"
          icon={Menu02Icon}
        />
        <p className="text-muted-foreground/75 bg-background sticky top-0 text-sm font-medium">
          On This Page
        </p>
      </div>
      <div className="relative flex flex-row gap-1.5 overflow-visible">
        {/* w-8 + pl so circle/path strokes are not clipped on the left */}
        <div className="relative w-8 shrink-0 self-stretch overflow-visible pl-1">
          <TocIndicator
            toc={toc}
            activeIndex={activeIndex}
            className={indicatorClassName}
            activePathColor={indicatorActivePathColor}
            airplaneFill={indicatorAirplaneFill}
          />
        </div>
        <div className="flex h-fit min-w-0 flex-1 flex-col gap-2 pt-2">
          {toc.map((item) => (
            <a
              key={item.url}
              href={item.url}
              className="text-muted-foreground/75 hover:text-foreground data-[active=true]:text-foreground text-base leading-6 no-underline transition-colors duration-200 empty:hidden data-[active=true]:font-medium data-[depth=3]:pl-2 data-[depth=4]:pl-4"
              data-active={item.url === `#${activeHeading}`}
              data-depth={item.depth}
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
