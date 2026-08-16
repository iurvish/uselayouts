"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

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
            className="open-drawer-backdrop"
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
            className={cn("open-drawer", wide && "open-drawer--wide")}
            initial={enter}
            animate={shown}
            exit={{ ...enter, transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <header className="open-drawer-head">
              <h2>{title}</h2>
              <button type="button" className="open-icon-btn" onClick={onClose} aria-label="Close">
                <span aria-hidden>×</span>
              </button>
            </header>
            <div className="open-drawer-body">{children}</div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
