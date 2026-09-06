"use client";

/* eslint-disable @next/next/no-img-element -- browse posters are remote stills. */

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronsUpDown, Search } from "lucide-react";

import { scrollbarMinimal } from "@/components/open/ui";
import { browsePoster, SWITCHER_THUMB } from "@/lib/browse/media";
import type { OpenNavItem } from "@/lib/open/component";
import { cn } from "@/lib/utils";

const TITLE_SUFFIX = " | uselayouts";

/** Figma 91:4677 container shadow */
const DROPDOWN_SHADOW =
  "shadow-[0_6px_10px_-30px_rgba(0,0,0,0.04),0_4px_6px_-10px_rgba(0,0,0,0.25),0_2px_4px_-10px_rgba(0,0,0,0.25)]";

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
    <div ref={rootRef} className={cn("relative flex justify-center", open && "z-[999999999]")}>
      {/* Trigger: 16px title; L±2–3 hover/press, no scale */}
      <button
        type="button"
        className={cn(
          "relative inline-flex max-w-[min(42vw,320px)] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[14px] border-0 px-3.5 py-2 text-base tracking-[-0.42px] text-white outline-none focus-visible:outline-none focus-visible:ring-0",
          "bg-[hsl(240_6%_22%)]",
          "transition-[background-color] duration-150",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_25%)]",
          "active:bg-[hsl(240_6%_19%)]",
          "shadow-[0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.14),0_0_0_1px_hsla(0,0%,0%,0.1)]",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-[linear-gradient(180deg,transparent_30%,hsla(0,0%,0%,0.07)_100%)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
          "after:shadow-[inset_0_1px_0.5px_0_hsla(0,0%,100%,0.05)]",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setInstant(false);
          setOpen((value) => !value);
        }}
      >
        <span className="relative truncate">{displayed.title}</span>
        <ChevronsUpDown className="relative size-[18px] shrink-0" aria-hidden strokeWidth={1.75} />
      </button>
      <AnimatePresence>
        {open ? (
          /* Figma 91:4677 — rounded 14; modest px-2.5; container shadow */
          <motion.div
            role="listbox"
            className={cn(
              "absolute top-[calc(100%+8px)] left-1/2 z-[999999999] flex w-[min(320px,80vw)] origin-top flex-col overflow-hidden rounded-[14px] border-0 bg-popover text-popover-foreground",
              DROPDOWN_SHADOW,
            )}
            initial={instant ? false : { opacity: 0, transform: "translateX(-50%) scale(0.96)" }}
            animate={{ opacity: 1, transform: "translateX(-50%) scale(1)" }}
            exit={{ opacity: 0, transform: "translateX(-50%) scale(0.96)" }}
            transition={instant ? { duration: 0 } : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Figma 82:3700 search — same padding/radius/height; no `/` kbd; hidden on mobile */}
            <div className="hidden border-b border-border px-2.5 py-3 md:block">
              <div className="relative flex items-center gap-2 overflow-hidden rounded-[12px] bg-[#030202] px-3 py-2 shadow-[0px_0.5px_0px_0px_rgba(255,255,255,0.15)]">
                <Search className="size-4 shrink-0 text-[#acacb4]" aria-hidden strokeWidth={1.75} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  aria-label="Search components"
                  className="min-w-0 flex-1 bg-transparent text-sm tracking-[-0.42px] text-[#acacb4] outline-none placeholder:text-[#acacb4]"
                />
              </div>
            </div>
            <div className={cn("flex max-h-[280px] flex-col gap-0.5 overflow-auto px-2.5 py-2", scrollbarMinimal)}>
              {filtered.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-muted-foreground">No matches.</p>
              ) : (
                filtered.map((item) => {
                  const active = item.href === displayed.href;
                  const poster = browsePoster(item.slug);
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "relative z-10 flex w-full cursor-pointer items-center gap-2.5 rounded-none py-1.5 text-left text-sm text-foreground outline-none",
                        "transition-[background-color] duration-150",
                        "focus-visible:outline-none focus-visible:ring-0",
                        active
                          ? cn(
                              "bg-[hsl(240_7%_26%)] text-white",
                              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_7%_29%)]",
                              "active:bg-[hsl(240_7%_23%)]",
                              "focus-visible:bg-[hsl(240_7%_29%)]",
                            )
                          : cn(
                              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_23%)]",
                              "active:bg-[hsl(240_6%_18%)]",
                              "focus-visible:bg-[hsl(240_6%_23%)]",
                            ),
                      )}
                      onMouseEnter={() => router.prefetch(item.href)}
                      onFocus={() => router.prefetch(item.href)}
                      onClick={() => select(item)}
                    >
                      {poster ? (
                        <span
                          className="relative shrink-0 overflow-hidden rounded-md border border-white/14 bg-muted"
                          style={{ width: SWITCHER_THUMB.w, height: SWITCHER_THUMB.h }}
                        >
                          <img
                            src={poster}
                            alt=""
                            width={SWITCHER_THUMB.w}
                            height={SWITCHER_THUMB.h}
                            className="size-full object-cover"
                            draggable={false}
                          />
                        </span>
                      ) : null}
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
