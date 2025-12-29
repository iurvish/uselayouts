"use client";
import { delay, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import {
  InboxIcon,
  Message01Icon,
  PaintBoardIcon,
  Tag01Icon,
  Image01Icon,
  Archive02Icon,
  ArrowReloadHorizontalIcon,
  Delete02Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import useMeasure from "@/hooks/use-measure";

const ICON_SIZE = 24;

// Change Here
const primaryTools = [
  { icon: InboxIcon, label: "Inbox" },
  { icon: Message01Icon, label: "Messages" },
  { icon: PaintBoardIcon, label: "Paint" },
  { icon: Tag01Icon, label: "Tags", blur: true },
];

const secondaryTools = [
  { icon: Image01Icon, label: "Image", blur: true },
  { icon: Archive02Icon, label: "Archive" },
  {
    icon: ArrowReloadHorizontalIcon,
    label: "Reload",
    className: "-scale-x-100",
  },
  {
    icon: ArrowReloadHorizontalIcon,
    label: "Reload",
    className: "-scale-x-100",
  },
  { icon: Delete02Icon, label: "Delete", className: "text-red-500" },
];

function ToolbarButton({
  icon,
  size = ICON_SIZE,
  blur = false,
  isBlurred = false,
  className = "",
}: {
  icon: any;
  size?: number;
  blur?: boolean;
  isBlurred?: boolean;
  className?: string;
}) {
  const iconElement = (
    <HugeiconsIcon
      icon={icon}
      className={`text-foreground ${className}`}
      width={size}
      height={size}
    />
  );

  if (blur) {
    return (
      <button className="p-1 rounded-md hover:bg-accent/50 transition-colors hover:cursor-pointer">
        <motion.div
          initial={{ filter: "blur(0px)" }}
          animate={{ filter: isBlurred ? "blur(1px)" : "blur(0px)" }}
        >
          {iconElement}
        </motion.div>
      </button>
    );
  }

  return (
    <button className="p-1 rounded-md hover:bg-accent/50 transition-colors hover:cursor-pointer ">
      {iconElement}
    </button>
  );
}

function ExtendedToolbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [primaryRef, primaryBounds] = useMeasure();
  const [secondaryRef, secondaryBounds] = useMeasure();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentWidth = isExpanded ? secondaryBounds.width : primaryBounds.width;
  const hasMeasurements = primaryBounds.width > 0;

  const initialWidth = hasMeasurements ? primaryBounds.width : "auto";

  const springTransition = {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 0.8,
    bounce: 0.9,
    duration: isExpanded ? 0.4 : 1.2,
    delay: isExpanded ? 0 : 0.015,
  };

  return (
    <motion.div
      className="relative h-14 rounded-full bg-muted border border-border overflow-hidden"
      initial={{ width: initialWidth }}
      animate={
        hasMeasurements ? { width: currentWidth } : { width: initialWidth }
      }
      transition={isMounted ? springTransition : { duration: 0 }}
    >
      <motion.div
        className="h-full flex"
        initial={false}
        animate={{ x: isExpanded ? -primaryBounds.width : 0 }}
        transition={isMounted ? springTransition : { duration: 0 }}
      >
        {/* Primary Tools Panel */}
        <div
          ref={primaryRef as React.RefObject<HTMLDivElement>}
          className="flex items-center gap-1 p-1.5 pl-3 pr-2 flex-shrink-0"
        >
          {primaryTools.map((item, index) => (
            <ToolbarButton
              key={index}
              icon={item.icon}
              blur={item.blur}
              isBlurred={isExpanded}
            />
          ))}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="h-full aspect-square flex justify-center items-center bg-background rounded-full"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="text-muted-foreground"
              width={24}
              height={24}
            />
          </motion.button>
        </div>

        {/* Secondary Tools Panel */}
        <div
          ref={secondaryRef as React.RefObject<HTMLDivElement>}
          className="flex items-center gap-1 p-1.5 pl-2 pr-3 flex-shrink-0"
          style={{
            position: isExpanded ? "relative" : "absolute",
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(false)}
            className="h-full aspect-square flex justify-center items-center bg-background rounded-full"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="text-muted-foreground"
              width={24}
              height={24}
            />
          </motion.button>
          {secondaryTools.map((item, index) => (
            <ToolbarButton
              key={index}
              icon={item.icon}
              blur={item.blur}
              isBlurred={!isExpanded}
              className={item.className}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ExtendedToolbar;
