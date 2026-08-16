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

export function OpenExperience({
  data,
  navItems,
}: {
  data: OpenComponentData;
  navItems: OpenNavItem[];
}) {
  const [sidebar, setSidebar] = React.useState(false);
  const [panel, setPanel] = React.useState<OpenPanel>(null);
  const [manager, setManager] = usePackageManager();
  const current = navItems.find((item) => item.slug === data.slug) ?? {
    slug: data.slug,
    title: data.title,
    href: `/docs/components/${data.slug}`,
  };

  const drawerTitle =
    panel === "code" ? "Code" : panel === "hint" ? "Hints" : panel === "docs" ? "Docs" : "";

  return (
    <div className="open-page dark">
      <header className="open-chrome">
        <div className="open-chrome-left">
          <button
            type="button"
            className="open-icon-btn"
            aria-label={sidebar ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebar}
            onClick={() => setSidebar((open) => !open)}
          >
            <img src="/open/sidebar.svg" alt="" width={18} height={18} className="size-[18px]" />
          </button>
          <AnimatePresence>
            {sidebar ? (
              <motion.div
                className="open-sidebar"
                initial={{ opacity: 0, transform: "translateX(-8px) scale(0.98)" }}
                animate={{ opacity: 1, transform: "translateX(0px) scale(1)" }}
                exit={{ opacity: 0, transform: "translateX(-8px) scale(0.98)" }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              >
                <LineNav
                  items={navItems}
                  activeHref={current.href}
                  scrollActiveIntoView
                />
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

      <OpenDrawer
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={drawerTitle}
        wide={panel === "code" || panel === "docs"}
      >
        {panel === "code" ? (
          <OpenCodePanel
            usage={data.usage}
            usageHtml={data.usageHtml}
            code={data.code}
            codeHtml={data.codeHtml}
            registryUrl={data.registryUrl}
            dependencies={data.dependencies}
            manager={manager}
            onManagerChange={setManager}
          />
        ) : null}
        {panel === "hint" ? <OpenHintPanel hints={data.hints} /> : null}
        {panel === "docs" ? (
          <OpenDocsPanel description={data.description} docs={data.docs} />
        ) : null}
      </OpenDrawer>
    </div>
  );
}
