"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Globe } from "lucide-react";

import { LineNav } from "@/components/line-nav";
import { OpenActions, type OpenPanel } from "@/components/open/open-actions";
import { OpenCliBar } from "@/components/open/open-cli-bar";
import { OpenDrawer } from "@/components/open/open-drawer";
import { IconSwap, IconSwapItem } from "@/components/open/icon-swap";
import { OpenCodePanel } from "@/components/open/open-panels";
import { OpenPreview } from "@/components/open/open-preview";
import { OpenSwitcher } from "@/components/open/open-switcher";
import {
  SidebarHoverPreview,
  type SidebarHoverTarget,
} from "@/components/open/sidebar-hover-preview";
import { openChromeShadow, openIconBtn, openPress, scrollbarMinimal, scrollbarNone } from "@/components/open/ui";
import { usePackageManager } from "@/components/open/use-package-manager";
import type { OpenComponentData, OpenNavItem } from "@/lib/open/component";
import {
  parsePreviewBackgrounds,
  resolvePreviewBackground,
} from "@/lib/open/preview-background";
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

/** Closed: thin left rail. Open/pinned: thicker filled left panel (Figma panel-left). */
function SidebarGlyph({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 18 18"
        width={18}
        height={18}
        className="size-[18px]"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.75 1.25h8.5A3.5 3.5 0 0 1 16.75 4.75v8.5a3.5 3.5 0 0 1-3.5 3.5h-8.5a3.5 3.5 0 0 1-3.5-3.5v-8.5a3.5 3.5 0 0 1 3.5-3.5Zm0 1.25c-1.243 0-2.25 1.007-2.25 2.25v8.5c0 1.243 1.007 2.25 2.25 2.25H8V2.5H4.75Zm4.5 0v13h4a2.25 2.25 0 0 0 2.25-2.25v-8.5A2.25 2.25 0 0 0 13.25 2.5h-4Z"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 18 18"
      width={18}
      height={18}
      className="size-[18px]"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1.25"
        y="1.25"
        width="15.5"
        height="15.5"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M6.5 1.25V16.75" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function SidebarToggleIcon({ open }: { open: boolean }) {
  return (
    <IconSwap>
      <IconSwapItem key={open ? "open" : "closed"} className="flex size-[18px] items-center justify-center">
        <SidebarGlyph open={open} />
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
          scrollActiveIntoView
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
  data,
  navItems,
}: {
  data: OpenComponentData;
  navItems: OpenNavItem[];
}) {
  const [pinned, setPinned] = React.useState(false);
  const [peek, setPeek] = React.useState(false);
  const [hoverPreview, setHoverPreview] = React.useState<SidebarHoverTarget | null>(null);
  const peekPanelRef = React.useRef<HTMLDivElement>(null);
  const [panel, setPanel] = React.useState<OpenPanel>(null);
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [manager, setManager] = usePackageManager();
  const reduce = useReducedMotion();
  const current = navItems.find((item) => item.slug === data.slug) ?? {
    slug: data.slug,
    title: data.title,
    href: `/docs/components/${data.slug}`,
  };
  const backgrounds = React.useMemo(
    () => parsePreviewBackgrounds(data.previewBackground),
    [data.previewBackground],
  );
  const previewBackground = resolvePreviewBackground(backgrounds, theme);

  React.useLayoutEffect(() => {
    setPinned(readPinned());
  }, []);

  function updatePinned(value: boolean) {
    setPinned(value);
    writePinned(value);
  }

  const sharedPanel = {
    description: data.description,
    docs: data.docs,
    usage: data.usage,
    usageHtml: data.usageHtml,
    code: data.code,
    codeHtml: data.codeHtml,
    registryItem: data.registryItem,
    dependencies: data.dependencies,
    manager,
    onManagerChange: setManager,
    slug: data.slug,
  };

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
      style={{ background: previewBackground }}
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

        <main
          className={cn(
            "grid h-dvh w-full place-items-center overflow-auto px-4 pt-28 pb-[108px] sm:px-8",
            scrollbarMinimal,
          )}
          style={{ background: previewBackground }}
        >
          <OpenPreview name={data.slug} className="h-full w-full max-w-none" />
        </main>

        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 *:pointer-events-auto">
          <OpenCliBar
            registryItem={data.registryItem}
            manager={manager}
            onManagerChange={setManager}
          />
        </div>

        <OpenDrawer
          open={panel === "code"}
          onClose={() => setPanel(null)}
          title="Code"
          wide
        >
          <OpenCodePanel {...sharedPanel} />
        </OpenDrawer>
      </div>
    </div>
  );
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
