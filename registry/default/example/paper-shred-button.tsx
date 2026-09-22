"use client";

import { cn } from "@/lib/utils";
import type { Transition, Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ShredState = "idle" | "preview" | "shredding" | "shredded";

const IDLE_SHADOW = "0px 0px 0px rgba(3,7,18,0)";
const PREVIEW_SHADOW = "0px 8px 18px rgba(153,27,27,.18)";
const QUICK_TRANSITION = { duration: 0.01 } as const;
const SHRED_COMPLETE_DELAY = 1500;
const REDUCED_MOTION_SHRED_COMPLETE_DELAY = 120;
const RESET_DELAY_MS = 2500;

const buttonClassName = cn(
  "absolute top-[176px] left-1/2 z-20 inline-flex h-14 origin-bottom cursor-pointer items-center justify-center gap-3 select-none",
  "rounded-xl border-x-2 border-t-2 border-b-4 border-red-800 bg-red-500 px-8 py-3 whitespace-nowrap",
  "text-lg font-medium text-white ring-offset-background transition-colors hover:bg-red-600",
  "active:border-b-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-100",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
);

const iconClassName = "size-5 fill-white/80 stroke-transparent";

const documentClassName = cn(
  "pointer-events-none absolute top-[18px] left-1/2 z-10 h-40 w-[120px] opacity-0",
  "border border-black/10 bg-white [filter:drop-shadow(0_0_5px_rgba(0,0,0,0.06))]"
);

const shreddedSvgClassName = cn(
  "pointer-events-none absolute top-[218px] left-1/2 z-10 h-[150px] w-[120px] opacity-0",
  "fill-none stroke-white [filter:drop-shadow(0_0_5px_rgba(0,0,0,0.06))]"
);

const shredPaths = [
  "M22.74,0v59.49c0,3.37-.21,7.86-.53,12.79-1.34,20.7-4.18,32.27-8.35,52.58l-6.96,24.13",
  "M33.65,0v59.49c0,3.37-.17,7.86-.42,12.79-1.07,20.7-3.34,32.27-6.68,52.58l-5.57,24.13",
  "M44.56,0v59.49c0,3.37-.13,7.86-.32,12.79-.8,20.7-2.51,32.27-5.01,52.58l-4.18,24.13",
  "M55.47,0v59.49c0,3.37-.08,7.86-.21,12.79-.54,20.7-1.67,32.27-3.34,52.58l-2.78,24.13",
  "M66.37,0v59.49c0,3.37-.04,7.86-.11,12.79-.27,20.7-.84,32.27-1.67,52.58l-1.39,24.13",
  "M77.28,0v59.49c0,3.37,0,7.86,0,12.79,0,20.7,0,32.27,0,52.58v24.13",
  "M88.19,0v59.49c0,3.37.04,7.86.11,12.79.27,20.7.84,32.27,1.67,52.58l1.39,24.13",
  "M99.1,0v59.49c0,3.37.08,7.86.21,12.79.54,20.7,1.67,32.27,3.34,52.58l2.78,24.13",
  "M110.01,0v59.49c0,3.37.13,7.86.32,12.79.8,20.7,2.51,32.27,5.01,52.58l4.18,24.13",
  "M120.92,0v59.49c0,3.37.17,7.86.42,12.79,1.07,20.7,3.34,32.27,6.68,52.58l5.57,24.13",
  "M131.83,0v59.49c0,3.37.21,7.86.53,12.79,1.34,20.7,4.18,32.27,8.35,52.58l6.96,24.13",
];

const buttonVariants: Variants = {
  idle: {
    x: "-50%",
    scale: 1,
    y: 0,
    boxShadow: IDLE_SHADOW,
  },
  preview: {
    x: "-50%",
    scale: 1.03,
    y: -2,
    boxShadow: PREVIEW_SHADOW,
  },
  shredding: {
    x: "-50%",
    scale: 1,
    y: 0,
    boxShadow: IDLE_SHADOW,
  },
  shredded: {
    x: "-50%",
    scale: 1,
    y: 0,
    boxShadow: IDLE_SHADOW,
  },
};

const iconVariants: Variants = {
  idle: { rotate: 0, scale: 1 },
  preview: { rotate: -8, scale: 1.35 },
  shredding: { rotate: -8, scale: 1.15 },
  shredded: { rotate: 0, scale: 1 },
};

const documentVariants: Variants = {
  idle: {
    opacity: 0,
    x: "-50%",
    y: 14,
    scale: 0.94,
    clipPath: "inset(0% 0% 0% 0%)",
  },
  preview: {
    opacity: 1,
    x: "-50%",
    y: 0,
    scale: 1,
    clipPath: "inset(0% 0% 0% 0%)",
  },
  shredding: {
    opacity: 0,
    x: "-50%",
    y: 0,
    scale: 1,
    clipPath: "inset(100% 0% 0% 0%)",
  },
  shredded: {
    opacity: 0,
    x: "-50%",
    y: 155,
    scale: 1,
    clipPath: "inset(100% 0% 0% 0%)",
  },
};

const shreddedSvgVariants: Variants = {
  idle: { opacity: 0, x: "-50%" },
  preview: { opacity: 0, x: "-50%" },
  shredding: { opacity: 1, x: "-50%" },
  shredded: { opacity: 1, x: "-50%" },
};

const createDocumentTransition = (
  state: ShredState,
  shouldReduceMotion: boolean
): Transition => {
  if (shouldReduceMotion) {
    return QUICK_TRANSITION;
  }

  if (state === "shredding") {
    return { duration: 1.15, ease: [0.65, 0, 0.35, 1] };
  }

  if (state === "shredded") {
    return { duration: 0.12, ease: [0.215, 0.61, 0.355, 1] };
  }

  return { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] };
};

const createPathVariants = (shouldReduceMotion: boolean): Variants => ({
  idle: {
    pathLength: 0,
    opacity: 0,
    y: -4,
    transition: {
      duration: shouldReduceMotion ? QUICK_TRANSITION.duration : 0.08,
    },
  },
  preview: {
    pathLength: 0,
    opacity: 0,
    y: -4,
    transition: {
      duration: shouldReduceMotion ? QUICK_TRANSITION.duration : 0.08,
    },
  },
  shredding: (index: number) => ({
    pathLength: 1,
    opacity: 1,
    y: 0,
    transition: shouldReduceMotion
      ? { duration: 0.01 }
      : {
          pathLength: {
            delay: 0.25 + index * 0.035,
            duration: 0.55,
            ease: [0.215, 0.61, 0.355, 1],
          },
          opacity: {
            delay: 0.2 + index * 0.025,
            duration: 0.18,
          },
          y: {
            delay: 0.18 + index * 0.025,
            duration: 0.5,
            ease: [0.215, 0.61, 0.355, 1],
          },
        },
  }),
  shredded: {
    pathLength: 1,
    opacity: 1,
    y: 0,
  },
});

const isShredReady = (state: ShredState) =>
  state === "idle" || state === "preview";

const isShredDisabled = (state: ShredState) =>
  state === "shredding" || state === "shredded";

export function PaperShredButton() {
  const [shredState, setShredState] = useState<ShredState>("idle");
  const shouldReduceMotion = Boolean(useReducedMotion());
  const shredTimeoutRef = useRef<number | null>(null);

  const pathVariants = useMemo(
    () => createPathVariants(shouldReduceMotion),
    [shouldReduceMotion]
  );

  const documentTransition = useMemo(
    () => createDocumentTransition(shredState, shouldReduceMotion),
    [shredState, shouldReduceMotion]
  );

  const buttonTransition = useMemo(
    () =>
      shouldReduceMotion
        ? QUICK_TRANSITION
        : { duration: 0.18, ease: [0.215, 0.61, 0.355, 1] as const },
    [shouldReduceMotion]
  );

  const iconTransition = useMemo(
    () =>
      shouldReduceMotion
        ? QUICK_TRANSITION
        : { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] as const },
    [shouldReduceMotion]
  );

  const clearShredTimeout = useCallback(() => {
    if (shredTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(shredTimeoutRef.current);
    shredTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    return clearShredTimeout;
  }, [clearShredTimeout]);

  const handlePreviewStart = useCallback(() => {
    setShredState((currentState) => {
      if (currentState !== "idle") {
        return currentState;
      }

      return "preview";
    });
  }, []);

  const handlePreviewEnd = useCallback(() => {
    setShredState((currentState) => {
      if (currentState !== "preview") {
        return currentState;
      }

      return "idle";
    });
  }, []);

  const handleShred = useCallback(() => {
    if (!isShredReady(shredState)) {
      return;
    }

    clearShredTimeout();
    setShredState("shredding");

    shredTimeoutRef.current = window.setTimeout(() => {
      setShredState("shredded");
      shredTimeoutRef.current = window.setTimeout(() => {
        setShredState("idle");
        shredTimeoutRef.current = null;
      }, RESET_DELAY_MS);
    }, shouldReduceMotion ? REDUCED_MOTION_SHRED_COMPLETE_DELAY : SHRED_COMPLETE_DELAY);
  }, [clearShredTimeout, shredState, shouldReduceMotion]);

  return (
    <section
      aria-label="Shred document button demo"
      className="flex flex-col items-center justify-center"
    >
      <div className="relative h-92 w-60">
        <div className="relative isolate h-full w-full">
          <motion.button
            animate={shredState}
            aria-label="Shred document"
            className={buttonClassName}
            disabled={isShredDisabled(shredState)}
            initial={false}
            onBlur={handlePreviewEnd}
            onClick={handleShred}
            onFocus={handlePreviewStart}
            onHoverEnd={handlePreviewEnd}
            onHoverStart={handlePreviewStart}
            transition={buttonTransition}
            type="button"
            variants={buttonVariants}
          >
            <motion.svg
              aria-hidden="true"
              className={iconClassName}
              focusable="false"
              transition={iconTransition}
              variants={iconVariants}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                fillRule="evenodd"
              />
            </motion.svg>
            Delete
          </motion.button>

          <motion.div
            animate={shredState}
            className={documentClassName}
            initial={false}
            transition={documentTransition}
            variants={documentVariants}
          />

          <motion.svg
            animate={shredState}
            aria-hidden="true"
            className={shreddedSvgClassName}
            focusable="false"
            initial={false}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.12 }}
            variants={shreddedSvgVariants}
            viewBox="0 48 154.57 103.52"
            xmlns="http://www.w3.org/2000/svg"
          >
            {shredPaths.map((path, index) => (
              <motion.path
                custom={index}
                d={path}
                key={path}
                strokeLinecap="round"
                strokeWidth={9}
                variants={pathVariants}
              />
            ))}
          </motion.svg>
        </div>
      </div>
    </section>
  );
}

export default PaperShredButton;
