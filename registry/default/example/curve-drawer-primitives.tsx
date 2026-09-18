"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import Curve from "./curve-drawer-curve";

const CurveDrawerContext = React.createContext<{ open: boolean }>({
  open: false,
});
const DRAWER_SLIDE_DURATION_MS = 800;
const DRAWER_SLIDE_EASE = [0.76, 0, 0.24, 1] as const;

export function useCurveDrawerOpen() {
  return React.useContext(CurveDrawerContext).open;
}

export function CurveDrawer({
  open: controlledOpen,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const desiredOpen = controlledOpen ?? uncontrolledOpen;
  const [mountedOpen, setMountedOpen] = React.useState(desiredOpen);
  const [visualOpen, setVisualOpen] = React.useState(desiredOpen);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(() => {
    let visualTimer: ReturnType<typeof setTimeout> | null = null;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (desiredOpen) {
      visualTimer = setTimeout(() => {
        setMountedOpen(true);
        setVisualOpen(true);
      }, 0);

      return () => {
        if (visualTimer) {
          clearTimeout(visualTimer);
        }
      };
    }

    visualTimer = setTimeout(() => {
      setVisualOpen(false);
    }, 0);

    closeTimerRef.current = setTimeout(() => {
      setMountedOpen(false);
      closeTimerRef.current = null;
    }, DRAWER_SLIDE_DURATION_MS);

    return () => {
      if (visualTimer) {
        clearTimeout(visualTimer);
      }

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [desiredOpen]);

  const handleOpenChange = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    }
    if (controlledOpen === undefined) {
      setUncontrolledOpen(next);
    }
  };

  return (
    <CurveDrawerContext.Provider value={{ open: visualOpen }}>
      <DrawerPrimitive.Root
        data-slot="curve-drawer"
        onOpenChange={handleOpenChange}
        open={mountedOpen}
        {...props}
      >
        {children}
      </DrawerPrimitive.Root>
    </CurveDrawerContext.Provider>
  );
}

export function CurveDrawerTrigger(
  props: React.ComponentProps<typeof DrawerPrimitive.Trigger>
) {
  return <DrawerPrimitive.Trigger data-slot="curve-drawer-trigger" {...props} />;
}

export function CurveDrawerPortal(
  props: React.ComponentProps<typeof DrawerPrimitive.Portal>
) {
  return <DrawerPrimitive.Portal data-slot="curve-drawer-portal" {...props} />;
}

export function CurveDrawerClose(
  props: React.ComponentProps<typeof DrawerPrimitive.Close>
) {
  return <DrawerPrimitive.Close data-slot="curve-drawer-close" {...props} />;
}

export function CurveDrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[110] bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      data-slot="curve-drawer-overlay"
      {...props}
    />
  );
}

type CurveDrawerContentProps =
  React.ComponentProps<typeof DrawerPrimitive.Content> & {
    curveSide?: "left" | "right" | false;
    curveWidth?: number;
  };

export function CurveDrawerContent({
  className,
  children,
  curveSide,
  curveWidth = 100,
  style,
  ...props
}: CurveDrawerContentProps) {
  const { open } = React.useContext(CurveDrawerContext);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [inferredSide, setInferredSide] = React.useState<
    "left" | "right" | false
  >(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (curveSide !== undefined) {
      return;
    }

    const el = contentRef.current;
    if (!el) {
      return;
    }

    const getDirection = () => {
      const dir = el.getAttribute("data-vaul-drawer-direction") as
        | "left"
        | "right"
        | "top"
        | "bottom"
        | null;
      if (dir === "left" || dir === "right") {
        return dir;
      }
      return false;
    };

    setInferredSide(getDirection());

    const observer = new MutationObserver(() => {
      setInferredSide(getDirection());
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-vaul-drawer-direction"],
    });

    return () => observer.disconnect();
  }, [curveSide]);

  const resolvedSide = curveSide ?? inferredSide;
  const showCurve = resolvedSide === "left" || resolvedSide === "right";
  const drawerOffset =
    resolvedSide === "left"
      ? `calc(-100% - ${curveWidth}px)`
      : resolvedSide === "right"
        ? `calc(100% + ${curveWidth}px)`
        : "0";

  return (
    <CurveDrawerPortal data-slot="curve-drawer-portal">
      <CurveDrawerOverlay />

      <DrawerPrimitive.Content {...props} asChild>
        <motion.div
          animate={{
            x: open ? "0" : drawerOffset,
            transition: {
              duration: shouldReduceMotion ? 0.01 : 0.8,
              ease: DRAWER_SLIDE_EASE,
            },
          }}
          className={cn(
            "group/curve-drawer-content fixed z-[110] flex h-auto flex-col bg-popover text-sm text-popover-foreground outline-none",
            "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-full data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:max-w-sm data-[vaul-drawer-direction=left]:rounded-r-none",
            "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:max-w-sm data-[vaul-drawer-direction=right]:rounded-l-none",
            "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t",
            "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b",
            className
          )}
          data-slot="curve-drawer-content"
          initial={{ x: drawerOffset }}
          ref={contentRef}
          style={{ ...style, animation: "none", transition: "none" }}
        >
          <div className="relative h-full w-full overflow-visible">
            {children}
            {showCurve ? (
              <Curve
                curveWidth={curveWidth}
                open={open}
                side={resolvedSide as "left" | "right"}
              />
            ) : null}
          </div>
        </motion.div>
      </DrawerPrimitive.Content>
    </CurveDrawerPortal>
  );
}

export function CurveDrawerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/curve-drawer-content:text-center group-data-[vaul-drawer-direction=top]/curve-drawer-content:text-center md:gap-0.5 md:text-left",
        className
      )}
      data-slot="curve-drawer-header"
      {...props}
    />
  );
}

export function CurveDrawerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      data-slot="curve-drawer-footer"
      {...props}
    />
  );
}

export function CurveDrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn("font-medium text-base text-foreground", className)}
      data-slot="curve-drawer-title"
      {...props}
    />
  );
}

export function CurveDrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="curve-drawer-description"
      {...props}
    />
  );
}

export { Curve as CurveDrawerCurve };
