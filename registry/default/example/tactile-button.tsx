"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

// --- Utility function (works with or without @/lib/utils) ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Component Props Definition ---
export interface TactileButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  showIndicator?: boolean;
  indicatorColor?: "blue" | "green" | "amber" | "red" | "slate";
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
  className?: string;
}

// --- Framer Spring Animation Physics ---
const springTransition = {
  type: "spring" as const,
  bounce: 0.45,
  duration: 0.55,
};

/**
 * TactileButton - A 3D skeuomorphic liquid glass tactile button component
 * Recreated from Framer with realistic rocker switch tilt & spring physics.
 */
export const TactileButton = React.forwardRef<
  HTMLButtonElement,
  TactileButtonProps
>(
  (
    {
      className,
      children = "Get Started",
      showIndicator = true,
      indicatorColor = "blue",
      size = "default",
      fullWidth = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    // Responsive size configurations
    const sizeConfig = {
      sm: {
        container: "min-h-[44px] min-w-[130px]",
        base: "inset-[3px] rounded-[13px]",
        box: "px-3.5 py-1.5 text-sm sm:text-base gap-2 rounded-[12px]",
        indicator: "w-2.5 h-2.5",
        text: "text-sm sm:text-base leading-tight",
        pressedY: -8,
        pressedX: 2,
        rotate: -7.5,
      },
      default: {
        container: "min-h-[52px] sm:min-h-[60px] min-w-[150px] sm:min-w-[176px]",
        base: "inset-[4px] rounded-[15px]",
        box: "px-4 sm:px-[22px] pt-[6px] sm:pt-[7px] pb-[10px] sm:pb-[13px] text-base sm:text-[19px] md:text-[20px] gap-2.5 sm:gap-[12px] rounded-[15px]",
        indicator: "w-2.5 h-2.5 sm:w-[12px] sm:h-[12px]",
        text: "text-base sm:text-[19px] md:text-[20px] leading-snug sm:leading-[31px]",
        pressedY: -12,
        pressedX: 3,
        rotate: -8.5,
      },
      lg: {
        container: "min-h-[60px] sm:min-h-[72px] min-w-[180px] sm:min-w-[210px]",
        base: "inset-[5px] rounded-[18px]",
        box: "px-5 sm:px-7 pt-2 sm:pt-3 pb-3 sm:pb-4 text-lg sm:text-[22px] md:text-[24px] gap-3 sm:gap-3.5 rounded-[17px]",
        indicator: "w-3 h-3 sm:w-[14px] sm:h-[14px]",
        text: "text-lg sm:text-[22px] md:text-[24px] leading-snug sm:leading-[36px]",
        pressedY: -15,
        pressedX: 4,
        rotate: -8.8,
      },
    }[size];

    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center select-none overflow-visible touch-manipulation cursor-pointer",
          fullWidth ? "w-full" : "w-auto max-w-full",
          sizeConfig.container,
          className
        )}
      >
        {/* Recessed Socket Well (Framer "Button Base") */}
        <motion.div
          aria-hidden="true"
          className={cn(
            "absolute bg-[#cbcbcb]/90 backdrop-blur-md pointer-events-none transition-shadow",
            sizeConfig.base
          )}
          initial={false}
          animate={{
            boxShadow: isPressed
              ? "inset 0px 1px 3px 0px rgba(0, 0, 0, 0.38), inset 4px 7px 6px 0px rgba(0, 0, 0, 0.28), inset -1px -1px 2px 0px rgba(255, 255, 255, 0.4)"
              : "inset 0px 1px 2px 0px rgba(0, 0, 0, 0.25), inset -1px -1px 2px 0px rgba(255, 255, 255, 0.3)",
          }}
          transition={springTransition}
        />

        {/* 3D Liquid Glass Plunger Cap (Framer "Button Box") */}
        <motion.button
          ref={ref}
          type="button"
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => {
            setIsPressed(false);
            setIsHovered(false);
          }}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          onTouchCancel={() => setIsPressed(false)}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={onClick}
          className={cn(
            "relative z-10 flex items-center justify-center outline-none cursor-pointer overflow-hidden",
            "bg-gradient-to-b from-white/95 via-white/85 to-white/90 backdrop-blur-xl border border-white/60",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            fullWidth ? "w-full" : "w-auto",
            sizeConfig.box
          )}
          initial={false}
          animate={{
            // Tilt physics matching physical rocker switch depression
            rotate: isPressed ? sizeConfig.rotate : 0,
            y: isPressed ? sizeConfig.pressedY : isHovered ? -2 : 0,
            x: isPressed ? sizeConfig.pressedX : 0,
            boxShadow: isPressed
              ? "rgba(0, 0, 0, 0.22) -2px -6px 1px 0px inset, rgba(255, 255, 255, 0.9) 0.5px 1.5px 2px 0px inset, rgba(0, 0, 0, 0.15) 0px -1px 1px 0px inset, rgba(0, 0, 0, 0.12) 9px 10px 13px 0px, rgba(0, 0, 0, 0.04) 35px 38px 21px 0px, rgba(255, 255, 255, 0.6) 0px 1px 0px 0px inset"
              : isHovered
              ? "rgba(0, 0, 0, 0.20) -2px -7px 1px 0px inset, rgba(255, 255, 255, 0.95) 0.5px 2px 2px 0px inset, rgba(0, 0, 0, 0.15) 0px -1px 1px 0px inset, rgba(0, 0, 0, 0.12) 2px 3px 8px 0px, rgba(0, 0, 0, 0.10) 9px 12px 15px 0px, rgba(0, 0, 0, 0.06) 20px 24px 20px 0px, rgba(0, 0, 0, 0.02) 35px 38px 22px 0px, rgba(255, 255, 255, 0.7) 0px 1px 0px 0px inset"
              : "rgba(0, 0, 0, 0.20) -2px -6px 1px 0px inset, rgba(255, 255, 255, 0.9) 0.5px 1.5px 1px 0px inset, rgba(0, 0, 0, 0.15) 0px -1px 1px 0px inset, rgba(0, 0, 0, 0.10) 2px 2px 7px 0px, rgba(0, 0, 0, 0.09) 9px 10px 13px 0px, rgba(0, 0, 0, 0.05) 20px 22px 18px 0px, rgba(0, 0, 0, 0.01) 35px 38px 21px 0px, rgba(0, 0, 0, 0) 55px 60px 23px 0px, rgba(255, 255, 255, 0.5) 0px 1px 0px 0px inset",
          }}
          transition={springTransition}
          {...props}
        >
          {/* Glass Specular Reflection Sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-[14px] bg-gradient-to-b from-white/70 via-white/20 to-transparent"
          />

          {/* Liquid Glass Bead LED Indicator */}
          {showIndicator && (
            <motion.span
              aria-hidden="true"
              className={cn(
                "relative z-10 shrink-0 rounded-full",
                sizeConfig.indicator
              )}
              initial={false}
              animate={{
                backgroundColor:
                  isPressed || isHovered
                    ? indicatorColor === "blue"
                      ? "rgb(0, 102, 255)"
                      : indicatorColor === "green"
                      ? "rgb(16, 185, 129)"
                      : indicatorColor === "amber"
                      ? "rgb(245, 158, 11)"
                      : indicatorColor === "red"
                      ? "rgb(239, 68, 68)"
                      : "rgb(145, 173, 255)"
                    : "rgb(209, 215, 222)",
                boxShadow:
                  isPressed || isHovered
                    ? "0px 2px 2px 0px rgba(255, 255, 255, 0.9), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 0px 10px 2px rgba(0, 102, 255, 0.8), 0px 0px 20px 4px rgba(59, 130, 246, 0.4)"
                    : "0px 2px 2px 0px rgb(255, 255, 255), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.08), 0px -1px 1px 0px rgba(0, 0, 0, 0.1)",
              }}
              transition={springTransition}
            >
              {/* Droplet Specular Reflection */}
              <span
                aria-hidden="true"
                className="absolute top-[1px] left-[1.5px] h-[2px] w-[2px] sm:h-[3px] sm:w-[3px] rounded-full bg-white/95"
              />
            </motion.span>
          )}

          {/* Button Text */}
          <span
            className={cn(
              "relative z-10 font-sans font-medium tracking-normal text-[#292929] whitespace-nowrap",
              sizeConfig.text
            )}
          >
            {children}
          </span>
        </motion.button>
      </div>
    );
  }
);

TactileButton.displayName = "TactileButton";

export default function TactileButtonDemo() {
  return (
    <div className="flex h-full w-full items-center justify-center p-16">
      <TactileButton>Get Started</TactileButton>
    </div>
  );
}
