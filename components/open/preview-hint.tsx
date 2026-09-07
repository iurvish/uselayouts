"use client";

import { useEffect, useRef, type ReactNode } from "react";
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
}: {
  heading: string;
  description?: string;
  tone: "dark" | "light";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const scroller = nearestScroller(node);
    if (!scroller) return;

    const update = () => {
      const t = Math.min(Math.max(scroller.scrollTop, 0) / FADE_PX, 1);
      // ease-out on opacity so it doesn't drop linearly with scroll
      node.style.opacity = String(reduce ? (t > 0 ? 0 : 1) : (1 - t) ** 2);
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, [reduce]);

  return (
    <div ref={ref} className="pointer-events-none sticky top-0 z-0 h-0 w-full">
      <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-8 px-4 pt-20">
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
}: {
  heading: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  const overlay = (
    <HintOverlay heading={heading} description={description} tone={tone} />
  );

  if (!children) return overlay;

  return (
    <div className={cn("relative h-full w-full min-w-0", className)}>
      {overlay}
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
