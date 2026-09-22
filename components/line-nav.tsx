/**
 * This component is inspired by Devouring Details and Skiper UI.
 */
"use client"

import { memo } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { NewDot } from "@/components/ui/new-dot"
import { cn } from "@/lib/utils"

const MotionLink = motion.create(Link)

const lineVariants = {
  normal: { width: 24 },
  active: { width: 40 },
  hover: { width: 40 },
}

const lineTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 20,
}

export type LineNavItem = {
  title: string
  href: string
  isNew?: boolean
}

export type LineNavProps = {
  className?: string
  items: LineNavItem[]
  activeHref?: string
  onItemClick?: (
    item: LineNavItem,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => void
  onItemHover?: (
    item: LineNavItem | null,
    anchor: HTMLAnchorElement | null,
  ) => void
}

export function LineNav({
  className,
  items,
  activeHref,
  onItemClick,
  onItemHover,
}: LineNavProps) {
  return (
    <nav
      aria-label="Components"
      className={cn("flex flex-col gap-2 py-5.25", className)}
      style={
        {
          "--line-nav-width": `${lineVariants.normal.width}px`,
        } as React.CSSProperties
      }
      onMouseLeave={() => onItemHover?.(null, null)}
    >
      {items.map((item, index) => {
        const isActive = item.href === activeHref
        return (
          <LineNavItem
            key={item.href}
            title={item.title}
            href={item.href}
            active={isActive}
            isNew={item.isNew}
            isLast={index === items.length - 1}
            onClick={
              onItemClick ? (event) => onItemClick(item, event) : undefined
            }
            onHover={
              onItemHover
                ? (anchor) => onItemHover(anchor ? item : null, anchor)
                : undefined
            }
          />
        )
      })}
    </nav>
  )
}

const LineNavItem = memo(function LineNavItem({
  title,
  href,
  active = false,
  isNew = false,
  isLast = false,
  onClick,
  onHover,
}: {
  title: string
  href: string
  active?: boolean
  isNew?: boolean
  isLast?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  onHover?: (anchor: HTMLAnchorElement | null) => void
}) {
  return (
    <>
      <MotionLink
        aria-current={active ? "page" : undefined}
        aria-label={isNew ? `${title}, new` : undefined}
        className="group relative flex h-px items-center gap-3 outline-none after:absolute after:top-1/2 after:left-0 after:size-full after:-translate-y-1/2 after:p-3.5 focus-visible:outline-none"
        href={href}
        scroll={false}
        prefetch
        initial={false}
        animate={active ? "active" : "normal"}
        whileHover="hover"
        onClick={onClick}
        onMouseEnter={(event) => onHover?.(event.currentTarget)}
        onFocus={(event) => onHover?.(event.currentTarget)}
        onBlur={() => onHover?.(null)}
      >
        <motion.span
          className="block h-px shrink-0 bg-white/20 transition-[background-color] ease-out group-hover:bg-white group-aria-[current=page]:bg-white"
          variants={lineVariants}
          transition={lineTransition}
        />
        <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-white/40 transition-[color] ease-out group-hover:text-white group-aria-[current=page]:text-white">
          {title}
          {isNew ? <NewDot /> : null}
        </span>
      </MotionLink>
      {!isLast ? (
        <>
          <span className="block h-px w-(--line-nav-width) bg-white/20" />
          <span className="block h-px w-(--line-nav-width) bg-white/20" />
        </>
      ) : null}
    </>
  )
})
