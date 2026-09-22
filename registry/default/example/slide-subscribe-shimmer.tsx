"use client"

import { useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"

export type ShimmeringTextProps = React.ComponentProps<"span"> & {
  text: string
  /** Seconds for one sweep. */
  duration?: number
  isStopped?: boolean
}

export function ShimmeringText({
  text,
  duration = 2,
  isStopped = false,
  className,
  style,
  ...props
}: ShimmeringTextProps) {
  const reduce = useReducedMotion() ?? false
  const paused = reduce || isStopped

  return (
    <span
      className={cn(
        "inline-block select-none",
        "[--color:var(--muted-foreground)] [--shimmering-color:var(--foreground)]",
        paused
          ? "text-[var(--color)]"
          : cn(
              "bg-clip-text text-transparent",
              "[background-size:200%_100%]",
              "[background-image:linear-gradient(90deg,var(--color)_40%,var(--shimmering-color)_50%,var(--color)_60%)]",
              "[animation:shiny-text_var(--shimmer-duration,2s)_linear_infinite]",
              "motion-reduce:animate-none motion-reduce:bg-none motion-reduce:text-[var(--color)]",
            ),
        className,
      )}
      style={{ "--shimmer-duration": `${duration}s`, ...style } as React.CSSProperties}
      {...props}
    >
      {text}
    </span>
  )
}
