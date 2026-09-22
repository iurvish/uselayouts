"use client";

import type { PropsWithChildren } from "react";
import type { AnimatePresenceProps, HTMLMotionProps } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export function IconSwap(props: PropsWithChildren<AnimatePresenceProps>) {
  return <AnimatePresence mode="popLayout" initial={false} {...props} />;
}

type MotionElement = typeof motion.div | typeof motion.span;

export function IconSwapItem({
  as: Component = motion.div,
  ...props
}: HTMLMotionProps<"div"> & {
  as?: MotionElement;
}) {
  const reduce = useReducedMotion();

  return (
    <Component
      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              type: "spring",
              duration: 0.3,
              bounce: 0,
            }
      }
      {...props}
    />
  );
}
