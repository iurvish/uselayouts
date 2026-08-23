"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { autoUpdate } from "@floating-ui/dom";

import { cn } from "@/lib/utils";

function hasOverlay(overlay?: React.ReactNode) {
  if (overlay == null || overlay === false) return false;
  if (Array.isArray(overlay) && overlay.length === 0) return false;
  return true;
}

function resolveTarget(hold: HTMLElement): HTMLElement | null {
  for (const node of hold.children) {
    if (!(node instanceof HTMLElement)) continue;
    if (node.dataset.hintIgnore != null) continue;
    return node;
  }
  return null;
}

export function HintOverlayFrame({
  className,
  children,
  overlay,
  onTargetRect,
}: {
  className?: string;
  children: React.ReactNode;
  overlay?: React.ReactNode;
  onTargetRect?: (rect: { width: number; height: number }) => void;
}) {
  const holdRef = React.useRef<HTMLDivElement>(null);
  const onRectRef = React.useRef(onTargetRect);
  const lastSize = React.useRef({ w: 0, h: 0 });
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const [floating, setFloating] = React.useState<HTMLDivElement | null>(null);
  const [ready, setReady] = React.useState(false);

  onRectRef.current = onTargetRect;

  const discover = React.useCallback(() => {
    const hold = holdRef.current;
    if (!hold) return;
    setTarget(resolveTarget(hold));
  }, []);

  React.useEffect(() => {
    setReady(true);
  }, []);

  React.useLayoutEffect(() => {
    discover();
    const hold = holdRef.current;
    if (!hold) return;
    const mutations = new MutationObserver(discover);
    mutations.observe(hold, { childList: true, subtree: true });
    return () => mutations.disconnect();
  }, [discover]);

  React.useLayoutEffect(() => {
    if (!target || !floating) return;

    return autoUpdate(
      target,
      floating,
      () => {
        const rect = target.getBoundingClientRect();
        floating.style.position = "fixed";
        floating.style.left = `${rect.left}px`;
        floating.style.top = `${rect.top}px`;
        floating.style.width = `${rect.width}px`;
        floating.style.height = `${rect.height}px`;

        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        if (width !== lastSize.current.w || height !== lastSize.current.h) {
          lastSize.current = { w: width, h: height };
          onRectRef.current?.({ width: rect.width, height: rect.height });
        }
      },
      {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true,
        layoutShift: true,
        animationFrame: true,
      },
    );
  }, [target, floating]);

  return (
    <>
      <div ref={holdRef} className={cn("grid min-h-80 w-full place-items-center", className)}>
        {children}
      </div>
      {ready && hasOverlay(overlay)
        ? createPortal(
            <div
              ref={setFloating}
              className="pointer-events-none z-[11] overflow-visible [container-type:size]"
              aria-hidden
            >
              {overlay}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
