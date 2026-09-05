"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { openChromeShadow, openPress, scrollbarMinimal } from "@/components/open/ui";
import type { OpenNavItem } from "@/lib/open/component";
import { cn } from "@/lib/utils";

const TITLE_SUFFIX = " | uselayouts";

function setDocumentTitle(title: string) {
  if (typeof document === "undefined") return;
  document.title = `${title}${TITLE_SUFFIX}`;
}

export function OpenSwitcher({
  current,
  items,
}: {
  current: OpenNavItem;
  items: OpenNavItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [instant, setInstant] = React.useState(false);
  const [pending, setPending] = React.useState<OpenNavItem | null>(null);

  const pathCurrent =
    items.find((item) => item.href === pathname) ??
    items.find((item) => item.slug === current.slug) ??
    current;
  const displayed = pending ?? pathCurrent;

  React.useEffect(() => {
    if (pending && pending.href === pathname) setPending(null);
  }, [pathname, pending]);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => item.title.toLowerCase().includes(needle) || item.slug.includes(needle));
  }, [items, query]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typingInField = target && /^(INPUT|TEXTAREA)$/.test(target.tagName);
      if (event.key === "/" && !typingInField) {
        event.preventDefault();
        setInstant(true);
        setOpen(true);
        return;
      }
      if (
        !open &&
        !typingInField &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key.length === 1 &&
        /[\w-]/i.test(event.key)
      ) {
        setInstant(true);
        setOpen(true);
        setQuery(event.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function select(item: OpenNavItem) {
    close();
    if (item.href === pathname || item.href === current.href) return;
    setPending(item);
    setDocumentTitle(item.title);
    router.push(item.href, { scroll: false });
  }

  return (
    <div ref={rootRef} className="relative flex justify-center">
      <button
        type="button"
        className={cn(
          "inline-flex max-w-[min(42vw,360px)] items-center justify-center gap-2 rounded-xl border-0 bg-secondary px-3 py-2 text-sm tracking-tight text-secondary-foreground outline-none focus-visible:outline-none focus-visible:ring-0",
          openChromeShadow,
          openPress,
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setInstant(false);
          setOpen((value) => !value);
        }}
      >
        <span className="truncate">{displayed.title}</span>
        <img src="/open/expand.svg" alt="" width={18} height={18} className="size-[18px] shrink-0 opacity-80" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="listbox"
            className="absolute top-[calc(100%+8px)] left-1/2 z-30 w-[min(360px,80vw)] origin-top rounded-xl border-0 bg-card p-2 text-card-foreground shadow-[0_6px_10px_-30px_rgba(0,0,0,0.04),0_4px_6px_-10px_rgba(0,0,0,0.25),0_2px_4px_-10px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)]"
            initial={instant ? false : { opacity: 0, transform: "translateX(-50%) scale(0.96)" }}
            animate={{ opacity: 1, transform: "translateX(-50%) scale(1)" }}
            exit={{ opacity: 0, transform: "translateX(-50%) scale(0.96)" }}
            transition={instant ? { duration: 0 } : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search components"
              aria-label="Search components"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className={cn("mt-1.5 max-h-[280px] overflow-auto", scrollbarMinimal)}>
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">No matches.</p>
              ) : (
                filtered.map((item) => {
                  const active = item.href === displayed.href;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "flex w-full min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-left text-sm text-muted-foreground outline-none focus-visible:outline-none focus-visible:ring-0",
                        openPress,
                        active && "bg-accent text-accent-foreground",
                      )}
                      onMouseEnter={() => router.prefetch(item.href)}
                      onFocus={() => router.prefetch(item.href)}
                      onClick={() => select(item)}
                    >
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
