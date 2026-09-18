"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Drawer as DrawerPrimitive } from "vaul";

import { CartDemo, FieldDemo } from "./drawer-buttons-field";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  drawerContentClassName,
} from "./drawer-buttons-drawer";

type DrawerRevealSide = "left" | "right";

type MotionDrawerContentProps = {
  children: ReactNode;
  className?: string;
  open: boolean;
  side: DrawerRevealSide;
  transitionDuration: number;
};

const DRAWER_REVEAL_DURATION_SECONDS = 0.48;
const drawerRevealEase = [0.22, 1, 0.36, 1] as const;

const useAnimatedDrawerState = (transitionDuration: number) => {
  const [mountedOpen, setMountedOpen] = useState(false);
  const [visualOpen, setVisualOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visualTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (visualTimerRef.current) {
      clearTimeout(visualTimerRef.current);
      visualTimerRef.current = null;
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    clearTimers();

    if (nextOpen) {
      setMountedOpen(true);
      visualTimerRef.current = setTimeout(() => {
        setVisualOpen(true);
        visualTimerRef.current = null;
      }, 0);
      return;
    }

    setVisualOpen(false);
    closeTimerRef.current = setTimeout(() => {
      setMountedOpen(false);
      closeTimerRef.current = null;
    }, transitionDuration * 1000);
  };

  useEffect(() => clearTimers, []);

  return {
    mountedOpen,
    visualOpen,
    handleOpenChange,
  };
};

const getDrawerRevealTransform = (side: DrawerRevealSide, open: boolean) => {
  if (open) {
    return "translate3d(0px, 0px, 0px) rotateY(0deg) scaleY(1)";
  }

  const rotationDirection = side === "left" ? 1 : -1;
  const x = side === "left" ? "calc(-100% - 48px)" : "calc(100% + 48px)";

  return `translate3d(${x}, 0px, -280px) rotateY(${
    rotationDirection * 22
  }deg) scaleY(0.74)`;
};

const MotionDrawerContent = ({
  children,
  className,
  open,
  side,
  transitionDuration,
}: MotionDrawerContentProps) => {
  const shouldReduceMotion = useReducedMotion();
  const transform = shouldReduceMotion
    ? "translate3d(0px, 0px, 0px) rotateY(0deg) scaleY(1)"
    : getDrawerRevealTransform(side, open);

  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <div
        className="pointer-events-none fixed inset-0 z-[110] [perspective:1200px]"
        style={{
          perspectiveOrigin: side === "left" ? "left center" : "right center",
        }}
      >
        <DrawerPrimitive.Content asChild>
          <motion.div
            data-slot="drawer-content"
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    transform: getDrawerRevealTransform(side, false),
                  }
            }
            animate={{
              opacity: open ? 1 : 0,
              transform,
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    type: "tween",
                    duration: transitionDuration,
                    ease: drawerRevealEase,
                  }
            }
            className={cn(
              drawerContentClassName,
              "pointer-events-auto my-auto h-[95dvh] overflow-y-auto p-0 [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform",
              className,
            )}
            style={{
              animation: "none",
              transition: "none",
              transformOrigin: side === "left" ? "left center" : "right center",
            }}
          >
            {children}
          </motion.div>
        </DrawerPrimitive.Content>
      </div>
    </DrawerPortal>
  );
};

export const DrawerButtons = () => {
  const paymentDrawer = useAnimatedDrawerState(DRAWER_REVEAL_DURATION_SECONDS);
  const cartDrawer = useAnimatedDrawerState(DRAWER_REVEAL_DURATION_SECONDS);

  return (
    <div className="flex h-full min-h-[520px] w-full items-center justify-center bg-background p-4 text-foreground">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Drawer
          direction="right"
          handleOnly
          open={paymentDrawer.mountedOpen}
          onOpenChange={paymentDrawer.handleOpenChange}
        >
          <DrawerTrigger asChild>
            <button
              type="button"
              aria-label="Open payment drawer"
              className={cn(buttonVariants(), "cursor-pointer")}
            >
              Payment details
            </button>
          </DrawerTrigger>
          <MotionDrawerContent
            open={paymentDrawer.visualOpen}
            side="right"
            transitionDuration={DRAWER_REVEAL_DURATION_SECONDS}
            className="sm:max-w-md"
          >
            <DrawerHeader className="flex-row items-start justify-between gap-4 border-b border-border">
              <div className="min-w-0">
                <DrawerTitle>Payment details</DrawerTitle>
                <DrawerDescription>
                  Enter checkout and billing information.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  aria-label="Close payment drawer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "shrink-0",
                  )}
                >
                  <X aria-hidden="true" />
                </button>
              </DrawerClose>
            </DrawerHeader>
            <div className="flex justify-center p-4 sm:p-6">
              <FieldDemo revealOpen={paymentDrawer.visualOpen} />
            </div>
          </MotionDrawerContent>
        </Drawer>

        <Drawer
          direction="left"
          handleOnly
          open={cartDrawer.mountedOpen}
          onOpenChange={cartDrawer.handleOpenChange}
        >
          <DrawerTrigger asChild>
            <button
              type="button"
              aria-label="Open cart drawer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "cursor-pointer",
              )}
            >
              Cart summary
            </button>
          </DrawerTrigger>
          <MotionDrawerContent
            open={cartDrawer.visualOpen}
            side="left"
            transitionDuration={DRAWER_REVEAL_DURATION_SECONDS}
            className="sm:max-w-md"
          >
            <DrawerHeader className="flex-row items-start justify-between gap-4 border-b border-border">
              <div className="min-w-0">
                <DrawerTitle>Cart summary</DrawerTitle>
                <DrawerDescription>
                  Review items, quantities, discounts, and total.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  aria-label="Close cart drawer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "shrink-0",
                  )}
                >
                  <X aria-hidden="true" />
                </button>
              </DrawerClose>
            </DrawerHeader>
            <div className="flex justify-center p-4 sm:p-6">
              <CartDemo revealOpen={cartDrawer.visualOpen} />
            </div>
          </MotionDrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default DrawerButtons;
