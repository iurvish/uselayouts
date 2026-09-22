"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DocsTableOfContents } from "@/components/mdx/table-of-content";

type TocItem = {
  title?: React.ReactNode;
  url: string;
  depth: number;
};

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -60% 0%" },
    );

    for (const id of itemIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [itemIds]);

  return activeId;
}

function useScrollProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? doc.scrollTop / scrollable : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return progress;
}

export function MorphToc({ toc }: { toc: TocItem[] }) {
  const [open, setOpen] = React.useState(false);
  const itemIds = React.useMemo(
    () => toc.map((item) => item.url.replace("#", "")),
    [toc],
  );
  const activeId = useActiveItem(itemIds);
  const progress = useScrollProgress();

  const activeTitle = React.useMemo(() => {
    const item = toc.find((t) => t.url === `#${activeId}`);
    if (!item?.title) return "On this page";
    return typeof item.title === "string" ? item.title : "On this page";
  }, [activeId, toc]);

  if (!toc?.length) return null;

  const size = 52;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 xl:bottom-8 xl:right-[calc(312px+0.75rem)]">
      <AnimatePresence>
        {open && (
          <motion.div
            key="toc-panel"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", visualDuration: 0.35, bounce: 0.2 }}
            className="pointer-events-auto max-h-[min(60vh,420px)] w-[260px] overflow-y-auto rounded-2xl border bg-background/95 p-3 shadow-xl backdrop-blur"
          >
            <DocsTableOfContents toc={toc} className="px-1 pt-1" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        layout
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "pointer-events-auto flex items-center gap-3 rounded-full border bg-background/95 p-1.5 pr-4 shadow-lg backdrop-blur transition-colors hover:bg-muted/80",
          open && "bg-muted",
        )}
        aria-expanded={open}
        aria-label="Toggle table of contents"
      >
        <span className="relative grid place-items-center">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-border"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="text-foreground transition-[stroke-dashoffset] duration-150"
            />
          </svg>
          <span className="absolute text-[10px] font-medium tabular-nums">
            {Math.round(progress * 100)}
          </span>
        </span>
        <span className="max-w-[140px] truncate text-left text-xs font-medium text-muted-foreground">
          {activeTitle}
        </span>
      </motion.button>
    </div>
  );
}
