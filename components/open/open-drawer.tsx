"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { openIconBtn, scrollbarMinimal } from "@/components/open/ui";
import { cn } from "@/lib/utils";

export function OpenDrawer({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const enter = reduce
    ? { opacity: 0 }
    : { opacity: 0, transform: "translateX(100%)" };
  const shown = reduce
    ? { opacity: 1 }
    : { opacity: 1, transform: "translateX(0%)" };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close panel"
            className="fixed inset-0 z-40 border-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "fixed top-0 right-0 z-50 flex h-dvh flex-col border-l border-white/12 bg-[#0f0f0f]",
              wide ? "w-[min(680px,100vw)]" : "w-[min(420px,100vw)]",
            )}
            initial={enter}
            animate={shown}
            exit={{ ...enter, transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <header className="flex items-center justify-between border-b border-white/8 px-4 pt-4 pb-3">
              <h2 className="text-sm font-medium tracking-[-0.02em]">{title}</h2>
              <button type="button" className={openIconBtn} onClick={onClose} aria-label="Close">
                <span aria-hidden>×</span>
              </button>
            </header>
            <div className={cn("min-h-0 flex-1 overflow-auto px-5 pt-5 pb-8", scrollbarMinimal)}>
              {children}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
