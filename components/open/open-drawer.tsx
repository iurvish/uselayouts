"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { openPressMotion, scrollbarMinimal } from "@/components/open/ui";
import { cn } from "@/lib/utils";

/** Figma 109:221 / 109:500 — floating right drawer chrome */
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
  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      swipeDirection="right"
      modal
    >
      <DrawerContent
        className={cn(
          "border border-white/10 bg-[hsl(240_5%_12%)] text-foreground",
          "rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04),0_8px_10px_-6px_rgba(0,0,0,0.1)]",
          "data-[swipe-direction=right]:rounded-2xl data-[swipe-direction=right]:border",
          /* Figma floating inset — beat default inset-y-0; full-bleed on mobile */
          "data-[swipe-axis=x]:top-[18px] data-[swipe-axis=x]:right-[18px] data-[swipe-axis=x]:bottom-[18px] data-[swipe-axis=x]:h-auto",
          "max-md:data-[swipe-axis=x]:inset-y-0 max-md:data-[swipe-axis=x]:right-0 max-md:data-[swipe-axis=x]:left-auto max-md:rounded-none max-md:data-[swipe-direction=right]:rounded-none",
          "[--drawer-inset:18px] [--drawer-content-width:min(460px,calc(100vw-36px))]",
          "max-md:[--drawer-inset:0px] max-md:[--drawer-content-width:100%]",
          wide && "[--drawer-content-width:min(680px,calc(100vw-36px))] max-md:[--drawer-content-width:100%]",
        )}
      >
        <DrawerHeader className="flex shrink-0 flex-row items-center justify-between gap-3 border-b border-[hsl(240_4%_29%)] px-4 py-2.5 text-left md:gap-3 md:text-left">
          <DrawerTitle className="text-[20px] leading-[1.3] font-normal tracking-[-0.2px] text-white">
            {title}
          </DrawerTitle>
          <DrawerClose
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg text-[hsl(240_5%_69%)]",
              openPressMotion,
              "outline-none focus-visible:outline-none",
            )}
            aria-label="Close"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </DrawerClose>
        </DrawerHeader>
        <div className={cn("min-h-0 flex-1 overflow-auto px-4 py-3", scrollbarMinimal)}>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
