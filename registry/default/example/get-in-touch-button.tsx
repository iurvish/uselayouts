"use client";

import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

export type FramerCtaVariant = "dark" | "light";

const ctaBaseClasses =
  "relative inline-flex min-h-10 items-center justify-center gap-2.5 rounded-sm pl-2 pr-2.5 text-white transition-transform duration-200 hover:text-white active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transform-none motion-reduce:transition-none cursor-pointer";

function ctaStyle(variant: FramerCtaVariant) {
  const isDark = variant === "dark";
  return {
    background: isDark
      ? "linear-gradient(rgb(27, 27, 27) 0%, rgb(0, 0, 0) 100%)"
      : "linear-gradient(rgb(233, 233, 233) 0%, rgb(255, 255, 255) 100%)",
    boxShadow: isDark
      ? "rgba(255, 255, 255, 0.3) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.32) 0px 0px 28px 0px inset, rgba(0, 0, 0, 0.03) 0px 8px 16px 0px, rgb(0, 0, 0) 0px 0px 0px 1px"
      : "rgba(0, 0, 0, 0.03) 0px 8px 8px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(255, 255, 255, 0.95) 0px 0px 34px 0px inset",
  };
}

interface FramerCtaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FramerCtaVariant;
}

export const PrimaryCtaButton = React.forwardRef<
  HTMLButtonElement,
  FramerCtaButtonProps
>(({ className, children, variant = "dark", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(ctaBaseClasses, className)}
      style={ctaStyle(variant)}
      {...props}
    >
      {children}
    </button>
  );
});

PrimaryCtaButton.displayName = "PrimaryCtaButton";

interface FramerCtaLinkProps extends React.ComponentProps<typeof Link> {
  variant?: FramerCtaVariant;
}

export const PrimaryCtaLink = ({
  className,
  children,
  variant = "dark",
  ...props
}: FramerCtaLinkProps) => {
  return (
    <Link
      className={cn(ctaBaseClasses, className)}
      style={ctaStyle(variant)}
      {...props}
    >
      {children}
    </Link>
  );
};

PrimaryCtaLink.displayName = "PrimaryCtaLink";
