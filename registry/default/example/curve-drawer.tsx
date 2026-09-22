"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

import {
  CurveDrawer,
  CurveDrawerClose,
  CurveDrawerContent,
  CurveDrawerDescription,
  CurveDrawerHeader,
  CurveDrawerTitle,
  CurveDrawerTrigger,
} from "./curve-drawer-primitives";

const NAV_ITEMS = ["Overview", "Projects", "Archive", "Settings"];

export function CurveDrawerDemo() {
  return (
    <section
      aria-label="Curve drawer demo"
      className="flex h-full min-h-[520px] w-full items-center justify-center bg-background p-4 text-foreground"
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <CurveDrawer direction="left" handleOnly>
          <CurveDrawerTrigger asChild>
            <button
              aria-label="Open menu drawer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "cursor-pointer"
              )}
              type="button"
            >
              Open left
            </button>
          </CurveDrawerTrigger>
          <CurveDrawerContent curveSide="left">
            <CurveDrawerHeader className="flex-row items-start justify-between gap-4 border-b border-border">
              <div className="min-w-0">
                <CurveDrawerTitle>Menu</CurveDrawerTitle>
                <CurveDrawerDescription>
                  The inner edge starts as a bulge, then settles straight.
                </CurveDrawerDescription>
              </div>
              <CurveDrawerClose asChild>
                <button
                  aria-label="Close menu drawer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "shrink-0"
                  )}
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </CurveDrawerClose>
            </CurveDrawerHeader>
            <nav aria-label="Demo menu" className="flex flex-col gap-1 p-4">
              {NAV_ITEMS.map((item) => (
                <span
                  className="rounded-lg px-3 py-2 text-sm text-foreground"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </nav>
          </CurveDrawerContent>
        </CurveDrawer>

        <CurveDrawer direction="right" handleOnly>
          <CurveDrawerTrigger asChild>
            <button
              aria-label="Open notes drawer"
              className={cn(buttonVariants(), "cursor-pointer")}
              type="button"
            >
              Open right
            </button>
          </CurveDrawerTrigger>
          <CurveDrawerContent curveSide="right">
            <CurveDrawerHeader className="flex-row items-start justify-between gap-4 border-b border-border">
              <div className="min-w-0">
                <CurveDrawerTitle>Notes</CurveDrawerTitle>
                <CurveDrawerDescription>
                  Same curve, mirrored on the left inner edge.
                </CurveDrawerDescription>
              </div>
              <CurveDrawerClose asChild>
                <button
                  aria-label="Close notes drawer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "shrink-0"
                  )}
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </CurveDrawerClose>
            </CurveDrawerHeader>
            <div className="space-y-3 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                The panel slides in over 800ms. The SVG arm morphs from a quadratic
                bulge to a straight edge.
              </p>
              <p>
                Touch drag is handle-only so scrolling the sheet does not dismiss
                it.
              </p>
            </div>
          </CurveDrawerContent>
        </CurveDrawer>
      </div>
    </section>
  );
}

export default CurveDrawerDemo;
