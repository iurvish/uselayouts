"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { LineNav } from "@/components/line-nav";
import { OpenActions } from "@/components/open/open-actions";
import { OpenPanelProvider, useOpenPanel } from "@/components/open/open-panel-context";
import { OpenSwitcher } from "@/components/open/open-switcher";
import {
  SidebarHoverPreview,
  type SidebarHoverTarget,
} from "@/components/open/sidebar-hover-preview";
import { openIconBtn, openPressMotion, scrollbarNone } from "@/components/open/ui";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { OpenNavItem } from "@/lib/open/component";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 262;
const PINNED_KEY = "uselayouts:open-sidebar-pinned";
const SCROLL_EDGE_EPS = 1;

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

/** Figma 102:6 — same glyph for default + hover; never swap on peek. */
function SidebarToggleIcon() {
  return (
    <img
      src="/open/sidebar.svg"
      alt=""
      width={22}
      height={22}
      className="size-[22px] transition-[filter] duration-150"
      draggable={false}
    />
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
            "inline-flex cursor-pointer items-center overflow-hidden rounded-xl border-0 bg-transparent p-1",
            "outline-none ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
            "shadow-[0_4px_2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.1)]",
            "hover:bg-transparent",
            "[@media(hover:hover)_and_(pointer:fine)]:hover:[&_img]:brightness-0",
            "[@media(hover:hover)_and_(pointer:fine)]:hover:[&_img]:invert",
            openPressMotion,
          )}
          aria-label="Close sidebar"
          aria-pressed="true"
          onClick={onClose}
        >
          <span className="inline-flex -scale-y-100 rotate-180">
            <img
              src="/open/sidebar-close.svg"
              alt=""
              width={18}
              height={18}
              className="size-[18px] transition-[filter] duration-150"
              draggable={false}
            />
          </span>
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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = React.useState(false);
  const [showBottom, setShowBottom] = React.useState(false);

  // Match panel bg exactly — pinned dock hsl(240 6% 7%), floating card hsl(240 6% 20%)
  const fadeFrom =
    surface === "sidebar" || surface === "background"
      ? "from-[hsl(240_6%_7%)]"
      : "from-[hsl(240_6%_20%)]";

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, clientHeight, scrollHeight } = el;
      setShowTop(scrollTop > 0);
      setShowBottom(scrollTop + clientHeight < scrollHeight - SCROLL_EDGE_EPS);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const child = el.firstElementChild;
    if (child) ro.observe(child);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [items]);

  return (
    <div className={cn("relative min-h-0 flex-1", tall && "h-[min(70dvh,560px)]")}>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-[2] h-12 bg-linear-to-b to-transparent transition-opacity duration-150",
          fadeFrom,
          showTop ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!showTop}
      />
      <div
        ref={scrollRef}
        className={cn("h-full overflow-auto pt-2 pr-2.5 pb-8 pl-3.5", scrollbarNone)}
      >
        <LineNav
          className="py-3"
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
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-12 bg-linear-to-t to-transparent transition-opacity duration-150",
          fadeFrom,
          showBottom ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!showBottom}
      />
    </div>
  );
}

/** Figma 102:444 — floating sidebar chrome */
const sidebarShell =
  "overflow-hidden rounded-[14px] border-0 bg-[hsl(240_6%_20%)] text-foreground shadow-[0_6px_10px_-30px_rgba(0,0,0,0.04),0_4px_6px_-10px_rgba(0,0,0,0.25),0_2px_4px_-10px_rgba(0,0,0,0.25)] origin-top-left";

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
  const isMobile = useIsMobile();
  const [pinned, setPinned] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
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

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (isMobile) {
      setPeek(false);
      setHoverPreview(null);
    }
  }, [isMobile]);

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

  const showDesktopPinned = pinned && !isMobile;
  const showToggle = !showDesktopPinned;

  return (
    <div className="dark flex h-dvh overflow-hidden bg-[hsl(240_6%_7%)] text-foreground">
      {showDesktopPinned ? (
        <aside
          className="sticky top-0 bottom-0 z-24 flex h-dvh shrink-0 flex-col items-center overflow-hidden bg-[hsl(240_6%_7%)] text-foreground"
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

      {/* Mobile: partial-width left sheet instead of full-bleed pinned sidebar */}
      <Sheet open={isMobile && mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="dark flex h-full max-w-[min(262px,85vw)] flex-col gap-0 border-r-0 bg-[hsl(240_6%_7%)] p-0 text-foreground sm:max-w-[262px]"
          style={{ width: `min(${SIDEBAR_WIDTH}px, 85vw)` }}
        >
          <PinnedSidebarHeader onClose={() => setMobileOpen(false)} />
          <SidebarList items={navItems} activeHref={current.href} surface="background" />
        </SheetContent>
      </Sheet>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[hsl(225_7%_11%)]">
        {showToggle ? (
          <div
            className={cn(
              "pointer-events-none absolute top-[18px] left-[18px] z-30",
              peek && "z-40",
            )}
            onMouseEnter={() => {
              if (!isMobile) setPeek(true);
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                setPeek(false);
                setHoverPreview(null);
              }
            }}
          >
            <button
              type="button"
              className={cn(
                openIconBtn,
                "pointer-events-auto cursor-pointer p-2.5 transition-[box-shadow,border-color,background-color,transform,color] duration-150",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:[&_img]:brightness-0",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:[&_img]:invert",
              )}
              data-active={peek || mobileOpen ? "true" : undefined}
              aria-label={
                isMobile
                  ? mobileOpen
                    ? "Close sidebar"
                    : "Open sidebar"
                  : peek
                    ? "Pin sidebar open"
                    : "Open sidebar"
              }
              aria-expanded={isMobile ? mobileOpen : peek}
              aria-pressed={false}
              onClick={() => {
                if (isMobile) {
                  setMobileOpen(true);
                  return;
                }
                updatePinned(true);
                setPeek(false);
                setHoverPreview(null);
              }}
            >
              <SidebarToggleIcon />
            </button>
            {!isMobile ? (
              <AnimatePresence>
                {peek ? (
                  <motion.div
                    ref={peekPanelRef}
                    className="pointer-events-auto absolute top-11 left-0 z-40 before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
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
            ) : null}
          </div>
        ) : null}

        {/* Above preview layers that escape stacking (e.g. magnified-bento lens z-40). Drawer portal is z-[110] so it covers this chrome. */}
        <header className="pointer-events-none absolute inset-x-[18px] top-[18px] z-[100] flex items-start justify-between gap-4 *:pointer-events-auto">
          <div className={cn(showToggle && "w-10")} />
          {showToggle ? <OpenSwitcher current={current} items={navItems} /> : <div />}
          <OpenActions panel={panel} onChange={setPanel} slug={current.slug} />
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
