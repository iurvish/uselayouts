"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { LineNav } from "@/components/line-nav";
import { OpenActions, type OpenPanel } from "@/components/open/open-actions";
import { OpenCliBar } from "@/components/open/open-cli-bar";
import { OpenDrawer } from "@/components/open/open-drawer";
import { OpenCodePanel, OpenDocsPanel, OpenHintPanel } from "@/components/open/open-panels";
import { OpenPreview } from "@/components/open/open-preview";
import { OpenSwitcher } from "@/components/open/open-switcher";
import { usePackageManager } from "@/components/open/use-package-manager";
import type { OpenComponentData, OpenNavItem } from "@/lib/open/component";
import { cn } from "@/lib/utils";

function SidebarList({
  items,
  activeHref,
}: {
  items: OpenNavItem[];
  activeHref: string;
}) {
  return (
    <div className="open-sidebar-shell">
      <div className="open-sidebar-fade open-sidebar-fade--top" />
      <div className="open-sidebar-scroll">
        <LineNav items={items} activeHref={activeHref} scrollActiveIntoView />
      </div>
      <div className="open-sidebar-fade open-sidebar-fade--bottom" />
    </div>
  );
}

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
  const [manager, setManager] = usePackageManager();
  const current = navItems.find((item) => item.slug === data.slug) ?? {
    slug: data.slug,
    title: data.title,
    href: `/docs/components/${data.slug}`,
  };

  const drawerTitle =
    panel === "code" ? "Code" : panel === "hint" ? "Hints" : panel === "docs" ? "Docs" : "";

  const sharedPanel = {
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

  return (
    <div className={cn("open-page dark", pinned && "is-split")}>
      {pinned ? (
        <aside className="open-rail">
          <SidebarList items={navItems} activeHref={current.href} />
        </aside>
      ) : null}

      <div className="open-workspace">
        <header className="open-chrome">
          <div
            className="open-chrome-left"
            onMouseEnter={() => {
              if (!pinned) setPeek(true);
            }}
            onMouseLeave={() => setPeek(false)}
          >
            <button
              type="button"
              className={cn("open-icon-btn", (pinned || peek) && "is-active")}
              aria-label={pinned ? "Close sidebar" : "Open sidebar"}
              aria-expanded={pinned || peek}
              onClick={() => {
                setPinned((open) => !open);
                setPeek(false);
              }}
            >
              <img src="/open/sidebar.svg" alt="" width={18} height={18} className="size-[18px]" />
            </button>
            <AnimatePresence>
              {peek && !pinned ? (
                <motion.div
                  className="open-sidebar"
                  initial={{ opacity: 0, transform: "translateX(-8px) scale(0.98)" }}
                  animate={{ opacity: 1, transform: "translateX(0px) scale(1)" }}
                  exit={{ opacity: 0, transform: "translateX(-8px) scale(0.98)" }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <SidebarList items={navItems} activeHref={current.href} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <OpenSwitcher current={current} items={navItems} />

          <OpenActions
            panel={panel}
            onChange={setPanel}
            hintDisabled={data.hints.length === 0}
          />
        </header>

        <main className="open-stage">
          <OpenPreview name={data.slug} />
        </main>

        <div className="open-cli-wrap">
          <OpenCliBar
            registryUrl={data.registryUrl}
            manager={manager}
            onManagerChange={setManager}
          />
        </div>
      </div>

      <OpenDrawer
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={drawerTitle}
        wide={panel === "code" || panel === "docs"}
      >
        {panel === "code" ? <OpenCodePanel {...sharedPanel} /> : null}
        {panel === "hint" ? <OpenHintPanel hints={data.hints} /> : null}
        {panel === "docs" ? (
          <OpenDocsPanel
            description={data.description}
            docs={data.docs}
            {...sharedPanel}
          />
        ) : null}
      </OpenDrawer>
    </div>
  );
}
