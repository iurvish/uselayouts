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
import { openIconBtn, openPressMotion, scrollbarNone } from "@/components/open/ui";
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

/** Paper GR-0 HH-0 panel icon (rotated when open/pinned). */
function SidebarToggleIcon({ open }: { open: boolean }) {
  return (
    <IconSwap>
      <IconSwapItem key={open ? "open" : "closed"} className="flex size-[18px] items-center justify-center">
        <img
          src={open ? "/open/sidebar-panel.svg" : "/open/sidebar.svg"}
          alt=""
          width={18}
          height={18}
          className={cn("size-[18px]", open && "rotate-180")}
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
        "flex w-full shrink-0 flex-col gap-3 overflow-hidden rounded-bl-[16px] rounded-br-[16px] bg-[hsl(240_5%_4%)] px-3.5 py-[15px]",
        "shadow-[0_1px_0_0_hsla(0,0%,100%,0.02),0_6px_16px_-14px_hsla(0,0%,0%,0.06),0_4px_8px_-12px_hsla(0,0%,0%,0.08),0_2px_6px_-10px_hsla(0,0%,0%,0.1)]",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <Link
          href="/browse"
          className="flex min-w-0 items-center outline-none focus-visible:ring-0"
          aria-label="uselayouts browse"
        >
          <img
            src="/brand/logo-wordmark.svg"
            alt="uselayouts"
            width={185}
            height={48}
            className="h-12 w-[185px] max-w-[185px]"
            draggable={false}
          />
        </Link>
        <button
          type="button"
          className={cn(
            "inline-flex size-[26px] items-center justify-center overflow-hidden rounded-xl border-0 bg-transparent p-1",
            "outline-none ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
            "shadow-[0_0_0_1px_hsla(0,0%,0%,0.1),0_4px_2px_hsla(0,0%,0%,0.24)]",
            "hover:bg-transparent",
            openPressMotion,
          )}
          aria-label="Close sidebar"
          aria-pressed="true"
          onClick={onClose}
        >
          <img
            src="/open/sidebar-panel.svg"
            alt=""
            width={15}
            height={13}
            className="h-[13px] w-[15px] rotate-180"
            draggable={false}
          />
        </button>
      </div>
      <div className="flex flex-col items-start justify-center gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-lg leading-[1.3] font-light tracking-[-0.18px] text-[hsl(240_7%_70%)] capitalize">
            Browse
          </span>
          <span className="inline-flex items-center overflow-hidden rounded-[14px] bg-white px-2 py-px">
            <span className="bg-linear-to-b from-[hsl(240_3%_14%)] to-[hsl(240_3%_20%)] bg-clip-text text-lg leading-[1.3] font-medium tracking-[-0.54px] text-transparent capitalize">
              50+
            </span>
          </span>
          <span className="text-lg leading-[1.3] font-light tracking-[-0.18px] text-[hsl(240_7%_70%)] capitalize">
            Carefully
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg leading-[1.3] font-light tracking-[-0.18px] text-[hsl(240_7%_70%)] capitalize">
            Crafted Components
          </span>
          <span
            className="inline-flex items-center overflow-hidden rounded-[7px] border border-[hsl(240_2%_27%)] bg-[hsl(240_3%_13%)] p-1"
            aria-hidden="true"
          >
            <Globe className="size-5 text-[hsl(240_7%_70%)]" strokeWidth={1.75} />
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
    <OpenPanelProvider>
      <OpenExperienceShell navItems={navItems}>{children}</OpenExperienceShell>
    </OpenPanelProvider>
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
    <div className="dark flex h-dvh overflow-hidden bg-[hsl(240_6%_7%)] text-foreground">
      {pinned ? (
        <aside
          className="sticky top-0 bottom-0 z-24 flex h-dvh w-[270px] shrink-0 flex-col items-center overflow-hidden bg-[hsl(240_6%_7%)] text-foreground"
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

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[hsl(225_7%_11%)]">
        {!pinned ? (
          <div
            className={cn("pointer-events-none absolute top-[18px] left-[18px] z-20", peek && "z-24")}
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
                "pointer-events-auto p-2.5 transition-[box-shadow,border-color,background-color,transform] duration-150",
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

        <header className="pointer-events-none absolute inset-x-[18px] top-[18px] z-20 flex items-start justify-between gap-4 *:pointer-events-auto">
          <div className={cn(!pinned && "w-10")} />
          {!pinned ? <OpenSwitcher current={current} items={navItems} /> : <div />}
          <OpenActions panel={panel} onChange={setPanel} />
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
