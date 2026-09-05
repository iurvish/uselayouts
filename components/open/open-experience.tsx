"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { LineNav } from "@/components/line-nav";
import { OpenActions, type OpenPanel } from "@/components/open/open-actions";
import { OpenCliBar } from "@/components/open/open-cli-bar";
import { OpenDrawer } from "@/components/open/open-drawer";
import { OpenCodePanel } from "@/components/open/open-panels";
import { OpenPreview } from "@/components/open/open-preview";
import { OpenSwitcher } from "@/components/open/open-switcher";
import { openIconBtn, openPress, scrollbarMinimal, scrollbarNone } from "@/components/open/ui";
import { usePackageManager } from "@/components/open/use-package-manager";
import type { OpenComponentData, OpenNavItem } from "@/lib/open/component";
import {
  parsePreviewBackgrounds,
  resolvePreviewBackground,
} from "@/lib/open/preview-background";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 248;
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

function SidebarList({
  items,
  activeHref,
  tall = false,
  tone = "dark",
}: {
  items: OpenNavItem[];
  activeHref: string;
  tall?: boolean;
  tone?: "light" | "dark";
}) {
  const fadeFrom = tone === "dark" ? "from-popover" : "from-background";
  return (
    <div className={cn("relative min-h-0 flex-1", tall && "h-[min(70dvh,560px)]")}>
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 z-[2] h-12 bg-linear-to-b to-transparent", fadeFrom)} />
      <div className={cn("h-full overflow-auto px-2.5 pt-3 pr-2.5 pb-8 pl-3.5", scrollbarNone)}>
        <LineNav items={items} activeHref={activeHref} scrollActiveIntoView />
      </div>
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-12 bg-linear-to-t to-transparent", fadeFrom)} />
    </div>
  );
}

const sidebarShell =
  "overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg origin-top-left";

export function OpenExperience({
  data,
  navItems,
}: {
  data: OpenComponentData;
  navItems: OpenNavItem[];
}) {
  const [pinned, setPinned] = React.useState(false);
  const [peek, setPeek] = React.useState(false);
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
          className="sticky top-0 z-24 m-3 flex h-[calc(100dvh-1.5rem)] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <header className="flex shrink-0 items-center border-b border-border px-3 pt-3 pb-2">
            <button
              type="button"
              className={openIconBtn}
              data-active="true"
              aria-label="Close sidebar"
              onClick={() => updatePinned(false)}
            >
              <img src="/open/sidebar.svg" alt="" width={18} height={18} className="size-[18px]" />
            </button>
          </header>
          <SidebarList items={navItems} activeHref={current.href} tone={theme} />
        </aside>
      ) : null}

      <div className="relative min-w-0 flex-1">
        {!pinned ? (
          <div
            className={cn("pointer-events-none absolute top-8 left-8 z-20", peek && "z-24")}
            onMouseEnter={() => setPeek(true)}
            onMouseLeave={() => setPeek(false)}
          >
            <button
              type="button"
              className={cn(openIconBtn, "pointer-events-auto transition-[box-shadow,border-color,background-color,transform] duration-150")}
              data-active={peek ? "true" : undefined}
              aria-label="Open sidebar"
              aria-expanded={peek}
              onClick={() => {
                updatePinned(true);
                setPeek(false);
              }}
            >
              <img src="/open/sidebar.svg" alt="" width={18} height={18} className="size-[18px]" />
            </button>
            <AnimatePresence>
              {peek ? (
                <motion.div
                  className={cn(
                    sidebarShell,
                    "pointer-events-auto absolute top-11 left-[-16px] z-24 w-[248px] max-h-[min(70dvh,560px)] before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']",
                  )}
                  initial={sidebarMotion.initial}
                  animate={sidebarMotion.animate}
                  exit={sidebarMotion.exit}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <SidebarList items={navItems} activeHref={current.href} tall tone={theme} />
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
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-border bg-card p-1 text-card-foreground shadow-sm">
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
