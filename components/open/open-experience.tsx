"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Globe } from "lucide-react";

import { LineNav } from "@/components/line-nav";
import { OpenActions } from "@/components/open/open-actions";
import { OpenPanelProvider, useOpenPanel } from "@/components/open/open-panel-context";
import { IconSwap, IconSwapItem } from "@/components/open/icon-swap";
import { OpenSwitcher } from "@/components/open/open-switcher";
import {
  SidebarHoverPreview,
  type SidebarHoverTarget,
} from "@/components/open/sidebar-hover-preview";
import { OpenThemeProvider, useOpenTheme } from "@/components/open/open-theme";
import { openChromeShadow, openIconBtn, openPress, scrollbarNone } from "@/components/open/ui";
import type { OpenNavItem } from "@/lib/open/component";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 270;
const PINNED_KEY = "uselayouts:open-sidebar-pinned";

function readPinned() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(PINNED_KEY) === "1";
  } catch {
    return false;
  }
}

function writePinned(value: boolean) {
  try {
    window.sessionStorage.setItem(PINNED_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

/** Closed: outline panel. Open/pinned: filled left rail (Figma node 102:5). */
function SidebarToggleIcon({ open }: { open: boolean }) {
  return (
    <IconSwap>
      <IconSwapItem key={open ? "open" : "closed"} className="flex size-[22px] items-center justify-center">
        <img
          src={open ? "/open/sidebar-open.svg" : "/open/sidebar.svg"}
          alt=""
          width={22}
          height={22}
          className="size-[22px]"
          draggable={false}
        />
      </IconSwapItem>
    </IconSwap>
  );
}

function PinnedSidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-3 rounded-bl-2xl rounded-br-2xl bg-sidebar px-3.5 py-[15px]",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.02),0_6px_16px_-14px_rgba(0,0,0,0.06),0_4px_8px_-12px_rgba(0,0,0,0.08),0_2px_6px_-10px_rgba(0,0,0,0.1)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/browse"
          className="flex min-w-0 items-center rounded-md outline-none focus-visible:ring-0"
          aria-label="uselayouts browse"
        >
          <img
            src="/brand/logo-wordmark.svg"
            alt="uselayouts"
            width={185}
            height={48}
            className="h-10 w-auto max-w-[185px]"
            draggable={false}
          />
        </Link>
        <button
          type="button"
          className={cn(openIconBtn, "size-7 rounded-[10px]")}
          data-active="true"
          aria-label="Close sidebar"
          aria-pressed="true"
          onClick={onClose}
        >
          <SidebarToggleIcon open />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-lg font-light tracking-tight text-muted-foreground capitalize">
            Browse
          </span>
          <span className="inline-flex items-center rounded-full bg-foreground px-2 py-px text-lg font-medium tracking-tight text-background capitalize">
            50+
          </span>
          <span className="text-lg font-light tracking-tight text-muted-foreground capitalize">
            Carefully
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-light tracking-tight text-muted-foreground capitalize">
            Crafted Components
          </span>
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground",
              openChromeShadow,
            )}
            aria-hidden="true"
          >
            <Globe className="size-4" strokeWidth={1.75} />
          </span>
        </div>
      </div>
    </header>
  );
}

function SidebarList({
  items,
  activeHref,
  tall = false,
  surface = "card",
  onItemHover,
}: {
  items: OpenNavItem[];
  activeHref: string;
  tall?: boolean;
  /** Scroll fade base — peek floating card vs pinned dock column */
  surface?: "card" | "background" | "sidebar";
  onItemHover?: (
    item: OpenNavItem | null,
    anchor: HTMLAnchorElement | null,
  ) => void;
}) {
  const fadeFrom =
    surface === "sidebar"
      ? "from-sidebar"
      : surface === "background"
        ? "from-background"
        : "from-card";
  return (
    <div className={cn("relative min-h-0 flex-1", tall && "h-[min(70dvh,560px)]")}>
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 z-[2] h-12 bg-linear-to-b to-transparent", fadeFrom)} />
      <div className={cn("h-full overflow-auto px-3 py-5 pb-8", scrollbarNone)}>
        <LineNav
          className="py-0"
          items={items}
          activeHref={activeHref}
          onItemClick={(item) => {
            document.title = `${item.title} | uselayouts`;
          }}
          onItemHover={
            onItemHover
              ? (item, anchor) => {
                  if (!item || !anchor) {
                    onItemHover(null, null);
                    return;
                  }
                  const match = items.find((entry) => entry.href === item.href) ?? null;
                  onItemHover(match, anchor);
                }
              : undefined
          }
        />
      </div>
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-12 bg-linear-to-t to-transparent", fadeFrom)} />
    </div>
  );
}

const sidebarShell =
  "overflow-hidden rounded-xl border-0 bg-card text-card-foreground shadow-[0_6px_10px_-30px_rgba(0,0,0,0.04),0_4px_6px_-10px_rgba(0,0,0,0.25),0_2px_4px_-10px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] origin-top-left";

export function OpenExperience({
  navItems,
  children,
}: {
  navItems: OpenNavItem[];
  children: React.ReactNode;
}) {
  return (
    <OpenThemeProvider>
      <OpenPanelProvider>
        <OpenExperienceShell navItems={navItems}>{children}</OpenExperienceShell>
      </OpenPanelProvider>
    </OpenThemeProvider>
  );
}

function OpenExperienceShell({
  navItems,
  children,
}: {
  navItems: OpenNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useOpenTheme();
  const { panel, setPanel } = useOpenPanel();
  const [pinned, setPinned] = React.useState(false);
  const [peek, setPeek] = React.useState(false);
  const [hoverPreview, setHoverPreview] = React.useState<SidebarHoverTarget | null>(null);
  const peekPanelRef = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const current = navItems.find((item) => item.href === pathname) ??
    navItems[0] ?? {
      slug: "component",
      title: "Component",
      href: pathname,
    };

  React.useLayoutEffect(() => {
    setPinned(readPinned());
  }, []);

  React.useEffect(() => {
    setDocumentTitle(current.title);
  }, [current.title]);

  function updatePinned(value: boolean) {
    setPinned(value);
    writePinned(value);
  }

  const sidebarMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, transform: "translateX(-8px) scale(0.98)" },
        animate: { opacity: 1, transform: "translateX(0px) scale(1)" },
        exit: { opacity: 0, transform: "translateX(-8px) scale(0.98)" },
      };

  return (
    <div
      className={cn(
        theme === "dark" ? "dark" : "light",
        "flex h-dvh overflow-hidden bg-background text-foreground",
      )}
    >
      {pinned ? (
        <aside
          className="sticky top-0 bottom-0 z-24 flex h-dvh shrink-0 flex-col overflow-hidden bg-background text-foreground"
          style={{ width: SIDEBAR_WIDTH }}
          data-sidebar="pinned"
        >
          <PinnedSidebarHeader
            onClose={() => {
              updatePinned(false);
              setHoverPreview(null);
            }}
          />
          <SidebarList
            items={navItems}
            activeHref={current.href}
            surface="background"
          />
        </aside>
      ) : null}

      <div className="relative min-w-0 flex-1">
        {!pinned ? (
          <div
            className={cn("pointer-events-none absolute top-8 left-8 z-20", peek && "z-24")}
            onMouseEnter={() => setPeek(true)}
            onMouseLeave={() => {
              setPeek(false);
              setHoverPreview(null);
            }}
          >
            <button
              type="button"
              className={cn(
                openIconBtn,
                "pointer-events-auto transition-[box-shadow,border-color,background-color,transform] duration-150",
              )}
              data-active={peek ? "true" : undefined}
              aria-label={peek ? "Pin sidebar open" : "Open sidebar"}
              aria-expanded={peek}
              aria-pressed={false}
              onClick={() => {
                updatePinned(true);
                setPeek(false);
                setHoverPreview(null);
              }}
            >
              <SidebarToggleIcon open={peek} />
            </button>
            <AnimatePresence>
              {peek ? (
                <motion.div
                  ref={peekPanelRef}
                  className="pointer-events-auto absolute top-11 left-0 z-24 before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
                  style={{ width: SIDEBAR_WIDTH + 8 + 177 }}
                  initial={sidebarMotion.initial}
                  animate={sidebarMotion.animate}
                  exit={sidebarMotion.exit}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className={cn(sidebarShell, "max-h-[min(70dvh,560px)]")} style={{ width: SIDEBAR_WIDTH }}>
                    <SidebarList
                      items={navItems}
                      activeHref={current.href}
                      tall
                      surface="card"
                      onItemHover={(item, anchor) => {
                        if (!item || !anchor || !peekPanelRef.current) {
                          setHoverPreview(null);
                          return;
                        }
                        const panelBox = peekPanelRef.current.getBoundingClientRect();
                        const rowBox = anchor.getBoundingClientRect();
                        const rawTop = rowBox.top + rowBox.height / 2 - panelBox.top - 117 / 2;
                        const maxTop = Math.max(0, panelBox.height - 117);
                        const top = Math.min(Math.max(0, rawTop), maxTop);
                        setHoverPreview({
                          slug: item.slug,
                          title: item.title,
                          top,
                        });
                      }}
                    />
                  </div>
                  <SidebarHoverPreview target={hoverPreview} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}

        <header className="pointer-events-none absolute inset-x-8 top-8 z-20 grid grid-cols-[1fr_auto_1fr] items-start *:pointer-events-auto">
          <div />
          <OpenSwitcher current={current} items={navItems} />
          <div className="flex items-center justify-self-end gap-2">
            <ThemeSegment theme={theme} onChange={setTheme} />
            <OpenActions panel={panel} onChange={setPanel} />
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

function setDocumentTitle(title: string) {
  if (typeof document === "undefined") return;
  document.title = `${title} | uselayouts`;
}

function ThemeSegment({
  theme,
  onChange,
}: {
  theme: "light" | "dark";
  onChange: (theme: "light" | "dark") => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border-0 bg-secondary p-1 text-secondary-foreground shadow-[0_2px_2px_-1px_rgba(0,0,0,0.16),0_4px_4px_-2px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.1)]">
      {(["light", "dark"] as const).map((value) => (
        <button
          key={value}
          type="button"
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize",
            openPress,
            theme === value ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          )}
          aria-pressed={theme === value}
          onClick={() => onChange(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
