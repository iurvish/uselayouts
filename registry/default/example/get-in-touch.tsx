"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ComponentProps, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { PrimaryCtaLink } from "./get-in-touch-button";

const END_STATE_DELAY_MS = 460;

const textTransition = { duration: 0.24, ease: [0.2, 0, 0, 1] } as const;
const avatarSpring = {
  type: "spring",
  stiffness: 460,
  damping: 26,
  mass: 0.8,
} as const;
const mergeSpring = { type: "spring", stiffness: 540, damping: 32 } as const;
const slideSpring = {
  type: "spring",
  stiffness: 360,
  damping: 17,
  mass: 0.9,
} as const;

const CLUSTER_CENTER_X = 32;
const HOVER_TEXT_DELAY = 0.2;

const DEFAULT_PORTRAIT =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80";

type InteractionPhase = "idle" | "start" | "end";

type BookACallLinkProps = Omit<
  ComponentProps<typeof PrimaryCtaLink>,
  "children" | "variant"
> & {
  imageSrc?: string;
  defaultText?: string;
  hoverText?: string;
};

export function BookACallLink({
  href,
  imageSrc = DEFAULT_PORTRAIT,
  defaultText = "GET IN TOUCH",
  hoverText = "Let's Talk!",
  className,
  ...linkProps
}: BookACallLinkProps) {
  const [interactionPhase, setInteractionPhase] =
    useState<InteractionPhase>("idle");
  const interactionPhaseRef = useRef<InteractionPhase>("idle");
  const endStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  const updateInteractionPhase = (nextPhase: InteractionPhase) => {
    interactionPhaseRef.current = nextPhase;
    setInteractionPhase(nextPhase);
  };

  const clearEndStateTimer = () => {
    if (!endStateTimerRef.current) {
      return;
    }

    clearTimeout(endStateTimerRef.current);
    endStateTimerRef.current = null;
  };

  const handleInteractionStart = () => {
    if (interactionPhaseRef.current !== "idle") {
      return;
    }

    clearEndStateTimer();

    if (shouldReduceMotion) {
      updateInteractionPhase("end");
      return;
    }

    updateInteractionPhase("start");
    endStateTimerRef.current = setTimeout(() => {
      updateInteractionPhase("end");
      endStateTimerRef.current = null;
    }, END_STATE_DELAY_MS);
  };

  const handleInteractionEnd = () => {
    if (isHoveredRef.current || isFocusedRef.current) {
      return;
    }

    clearEndStateTimer();
    updateInteractionPhase("idle");
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    handleInteractionStart();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    handleInteractionEnd();
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
    handleInteractionStart();
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    handleInteractionEnd();
  };

  useEffect(() => clearEndStateTimer, []);

  const isActive = interactionPhase !== "idle";
  const isEndState = interactionPhase === "end";

  const withMotion = <T extends object>(transition: T) =>
    shouldReduceMotion ? ({ duration: 0 } as const) : transition;

  return (
    <PrimaryCtaLink
      href={href}
      {...linkProps}
      variant="dark"
      tabIndex={0}
      aria-label={defaultText}
      data-phase={interactionPhase}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "isolate h-12 w-full max-w-48 shrink-0 overflow-hidden rounded-full p-0 text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
        className
      )}
    >
      <motion.span
        initial={false}
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-sm leading-none font-semibold"
        animate={{
          opacity: isActive ? 0 : 1,
          y: isActive ? -28 : 0,
          filter: isActive ? "blur(4px)" : "blur(0px)",
        }}
        transition={withMotion(textTransition)}
      >
        {defaultText}
      </motion.span>

      <motion.span
        initial={false}
        aria-hidden="true"
        data-book-layer="active"
        className="absolute inset-0 flex items-center justify-start gap-0 pl-2 text-xs leading-none font-semibold opacity-0"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={withMotion(textTransition)}
      >
        <motion.span
          initial={false}
          className="flex shrink-0 items-center justify-center"
          animate={{ x: isEndState ? 0 : CLUSTER_CENTER_X }}
          transition={withMotion(slideSpring)}
        >
          <motion.span
            initial={false}
            data-avatar-layer="portrait"
            className="relative z-0 block size-10 shrink-0 overflow-hidden rounded-full"
            animate={{
              opacity: isActive ? 1 : 0,
              rotate: isActive ? 0 : -180,
              x: isActive ? 0 : -40,
            }}
            transition={withMotion({
              ...avatarSpring,
              delay: isActive ? 0.04 : 0,
            })}
          >
            <img
              src={imageSrc}
              alt=""
              referrerPolicy="no-referrer"
              draggable={false}
              className="absolute inset-0 size-full object-cover"
            />
          </motion.span>

          <motion.span
            initial={false}
            aria-hidden="true"
            data-avatar-layer="plus"
            className="block overflow-hidden text-center text-base"
            animate={{
              opacity: isActive && !isEndState ? 1 : 0,
              scale: isActive && !isEndState ? 1 : 0.6,
              width: isActive && !isEndState ? 18 : 0,
              marginLeft: isActive && !isEndState ? 8 : 0,
              marginRight: isActive && !isEndState ? 8 : 0,
            }}
            transition={withMotion({
              ...mergeSpring,
              opacity: textTransition,
              delay: isActive && !isEndState ? 0.14 : 0,
            })}
          >
            +
          </motion.span>

          <motion.span
            initial={false}
            data-avatar-layer="you"
            className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black"
            animate={{
              opacity: isActive ? 1 : 0,
              rotate: isActive ? 0 : 180,
              x: isActive ? 0 : 40,
              marginLeft: isEndState ? -12 : 0,
            }}
            transition={withMotion({
              ...avatarSpring,
              marginLeft: mergeSpring,
              delay: isActive && !isEndState ? 0.1 : 0,
            })}
          >
            YOU
          </motion.span>
        </motion.span>

        <motion.span
          initial={false}
          className="block overflow-hidden whitespace-nowrap text-sm"
          animate={{
            width: isEndState ? "auto" : 0,
            marginLeft: isEndState ? 10 : 0,
            opacity: isEndState ? 1 : 0,
          }}
          transition={withMotion({
            width: {
              ...textTransition,
              delay: isEndState ? HOVER_TEXT_DELAY : 0,
            },
            marginLeft: {
              ...textTransition,
              delay: isEndState ? HOVER_TEXT_DELAY : 0,
            },
            opacity: {
              ...textTransition,
              delay: isEndState ? HOVER_TEXT_DELAY : 0,
            },
          })}
        >
          {hoverText}
        </motion.span>
      </motion.span>
    </PrimaryCtaLink>
  );
}

export default function GetInTouch() {
  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <BookACallLink href="#contact" />
    </div>
  );
}
