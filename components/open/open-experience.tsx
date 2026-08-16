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
import { openIconBtn, scrollbarMinimal, scrollbarNone } from "@/components/open/ui";
import { usePackageManager } from "@/components/open/use-package-manager";
import type { OpenComponentData, OpenNavItem } from "@/lib/open/component";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 248;

function SidebarList({
  items,
  activeHref,
  tall = false,
}: {
  items: OpenNavItem[];
  activeHref: string;
  tall?: boolean;
}) {
  return (
    <div className={cn("relative min-h-0 flex-1", tall && "h-[min(70dvh,560px)]")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-12 bg-linear-to-b from-[#030202] to-transparent" />
      <div className={cn("h-full overflow-auto px-2.5 pt-3 pr-2.5 pb-8 pl-3.5", scrollbarNone)}>
        <LineNav items={items} activeHref={activeHref} scrollActiveIntoView />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-12 bg-linear-to-t from-[#030202] to-transparent" />
    </div>
  );
}

const sidebarShell = "overflow-hidden rounded-2xl border border-white/12 bg-[#030202] origin-top-left";

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
  const [hintsPlaying, setHintsPlaying] = React.useState(false);
  const [manager, setManager] = usePackageManager();
  const reduce = useReducedMotion();
  const current = navItems.find((item) => item.slug === data.slug) ?? {
    slug: data.slug,
    title: data.title,
    href: `/docs/components/${data.slug}`,
  };
  const hasHints = data.interactionHints.items.length > 0;

  React.useEffect(() => {
    setHintsPlaying(false);
  }, [data.slug]);

  React.useEffect(() => {
    if (!hintsPlaying) return;
    const timeout = window.setTimeout(
      () => setHintsPlaying(false),
      data.interactionHints.duration * 1000,
    );
    return () => window.clearTimeout(timeout);
  }, [hintsPlaying, data.interactionHints.duration, data.slug]);

  const sharedPanel = {
    description: data.description,
    docs: data.docs,
    usage: data.usage,
    usageHtml: data.usageHtml,
    code: data.code,
    codeHtml: data.codeHtml,
    registryUrl: data.registryUrl,
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
      className="dark flex h-dvh overflow-hidden bg-[#141414] text-[#f7f7f7]"
      style={data.previewBackground ? { background: data.previewBackground } : undefined}
    >
      {pinned ? (
        <aside
          className="sticky top-0 z-[24] flex h-dvh shrink-0 flex-col border-r border-white/8 bg-[#121212]"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <header className="flex shrink-0 items-center px-3 pt-3 pb-1">
            <button
              type="button"
              className={openIconBtn}
              data-active="true"
              aria-label="Close sidebar"
              onClick={() => setPinned(false)}
            >
              <img src="/open/sidebar.svg" alt="" width={18} height={18} className="size-[18px]" />
            </button>
          </header>
          <SidebarList items={navItems} activeHref={current.href} />
        </aside>
      ) : null}

      <div className="relative min-w-0 flex-1">
        {!pinned ? (
          <div
            className={cn("pointer-events-none absolute top-8 left-8 z-20", peek && "z-[24]")}
            onMouseEnter={() => setPeek(true)}
            onMouseLeave={() => setPeek(false)}
          >
            <button
              type="button"
              className={cn(openIconBtn, "pointer-events-auto")}
              data-active={peek ? "true" : undefined}
              aria-label="Open sidebar"
              aria-expanded={peek}
              onClick={() => {
                setPinned(true);
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
                    "pointer-events-auto absolute top-11 left-[-16px] z-[24] w-[248px] max-h-[min(70dvh,560px)] before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']",
                  )}
                  initial={sidebarMotion.initial}
                  animate={sidebarMotion.animate}
                  exit={sidebarMotion.exit}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <SidebarList items={navItems} activeHref={current.href} tall />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}

        <header className="pointer-events-none absolute inset-x-8 top-8 z-20 grid grid-cols-[1fr_auto_1fr] items-start [&>*]:pointer-events-auto">
          <div />
          <OpenSwitcher current={current} items={navItems} />
          <OpenActions
            panel={panel}
            onChange={setPanel}
            hintActive={hintsPlaying}
            hintDisabled={!hasHints}
            onHint={() => setHintsPlaying((open) => !open)}
          />
        </header>

        <main
          className={cn("grid h-dvh w-full place-items-center overflow-auto px-8 pt-28 pb-[108px]", scrollbarMinimal)}
          style={data.previewBackground ? { background: data.previewBackground } : undefined}
        >
          <OpenPreview
            name={data.slug}
            hints={{ config: data.interactionHints, playing: hintsPlaying }}
          />
        </main>

        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 [&>*]:pointer-events-auto">
          <OpenCliBar
            registryUrl={data.registryUrl}
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
