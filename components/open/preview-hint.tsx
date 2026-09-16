"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const FADE_PX = 120;

function nearestScroller(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function scrollTopOf(target: HTMLElement | Window) {
  // iframe windows fail `instanceof Window` (different realm).
  if ("scrollY" in target) {
    return target.scrollY || target.document.documentElement.scrollTop || 0;
  }
  return target.scrollTop;
}

function listenScroll(target: HTMLElement | Window, onScroll: () => void) {
  target.addEventListener("scroll", onScroll, { passive: true });
  return () => target.removeEventListener("scroll", onScroll);
}

/** Lenis (and some iframe windows) update scrollY without a native scroll event. */
function watchTop(getTop: () => number, apply: (top: number) => void) {
  let last = Number.NaN;
  const tick = () => {
    const top = getTop();
    if (top === last) return;
    last = top;
    apply(top);
  };
  tick();
  let id = requestAnimationFrame(function loop() {
    tick();
    id = requestAnimationFrame(loop);
  });
  return () => cancelAnimationFrame(id);
}

function HintConnector({ tone }: { tone: "dark" | "light" }) {
  return (
    <div className="flex h-14 w-2 shrink-0 flex-col items-center" aria-hidden>
      <div
        className={cn(
          "size-2 shrink-0 rounded-[2px] border",
          tone === "light" ? "border-neutral-400/70" : "border-white/35",
        )}
      />
      <div
        className={cn(
          "w-px flex-1 bg-linear-to-b to-transparent",
          tone === "light" ? "from-neutral-400/70" : "from-white/35",
        )}
      />
    </div>
  );
}

function HintOverlay({
  heading,
  description,
  tone,
  absolute,
  hideOnScroll,
}: {
  heading: string;
  description?: string;
  tone: "dark" | "light";
  absolute: boolean;
  hideOnScroll: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!hideOnScroll) {
      node.style.opacity = "1";
      return;
    }

    const apply = (top: number) => {
      const t = Math.min(Math.max(top, 0) / FADE_PX, 1);
      node.style.opacity = String(reduce ? (t > 0 ? 0 : 1) : (1 - t) ** 2);
    };

    const iframe = node.parentElement?.querySelector("iframe");
    if (iframe instanceof HTMLIFrameElement) {
      let stop: (() => void) | undefined;
      const attach = () => {
        const win = iframe.contentWindow;
        if (!win) return;
        stop?.();
        stop = watchTop(() => scrollTopOf(win), apply);
      };
      attach();
      iframe.addEventListener("load", attach);
      return () => {
        iframe.removeEventListener("load", attach);
        stop?.();
      };
    }

    const scroller = nearestScroller(node) ?? window;
    apply(scrollTopOf(scroller));
    return listenScroll(scroller, () => apply(scrollTopOf(scroller)));
  }, [hideOnScroll, reduce]);

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none z-[1] w-full",
        absolute ? "absolute inset-x-0 top-0" : "sticky top-0 h-0",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-8 px-4",
          absolute ? "relative w-full" : "absolute inset-x-0",
        )}
        style={{ top: "var(--preview-hint-top, 80px)" }}
      >
        <div className="flex max-w-full flex-col items-center gap-1 text-center">
          <p
            className={cn(
              "text-balance font-[family-name:var(--font-geist-sans)] text-lg tracking-[-0.03em]",
              tone === "light" ? "text-neutral-900" : "text-white",
            )}
          >
            {heading}
          </p>
          {description ? (
            <p
              className={cn(
                "max-w-prose font-[family-name:var(--font-geist-sans)] text-sm tracking-[-0.03em] text-pretty",
                tone === "light" ? "text-neutral-500" : "text-muted-foreground",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        <HintConnector tone={tone} />
      </div>
    </div>
  );
}

export function PreviewHint({
  heading,
  description,
  children,
  className,
  tone = "dark",
  hideOnScroll = false,
}: {
  heading: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  tone?: "dark" | "light";
  /** Fade the hint as the preview (or its iframe) scrolls; it returns at the top. */
  hideOnScroll?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);

  useLayoutEffect(() => {
    if (!hideOnScroll) {
      setSticky(false);
      return;
    }
    setSticky(!wrapRef.current?.querySelector("iframe"));
  }, [hideOnScroll, children]);

  const overlay = (
    <HintOverlay
      heading={heading}
      description={description}
      tone={tone}
      absolute={!sticky}
      hideOnScroll={hideOnScroll}
    />
  );

  if (!children) return overlay;

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full min-w-0", className)}>
      {overlay}
      <div className="relative z-0 flex h-full min-h-0 w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
