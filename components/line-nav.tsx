"use client";

import { memo, useEffect, useRef } from "react";
import Link from "next/link";

import { NewDot } from "@/components/ui/new-dot";
import { cn } from "@/lib/utils";

export type LineNavItem = {
  title: string;
  href: string;
  isNew?: boolean;
};

export type LineNavProps = {
  className?: string;
  items: LineNavItem[];
  activeHref?: string;
  scrollActiveIntoView?: boolean;
  onItemClick?: (
    item: LineNavItem,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => void;
};

export function LineNav({
  className,
  items,
  activeHref,
  scrollActiveIntoView = true,
  onItemClick,
}: LineNavProps) {
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!scrollActiveIntoView) return;
    activeItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeHref, scrollActiveIntoView]);

  return (
    <nav className={cn("flex flex-col gap-2 py-3", className)} aria-label="Components">
      {items.map((item, index) => {
        const isActive = item.href === activeHref;
        return (
          <LineNavItem
            key={item.href}
            ref={isActive ? activeItemRef : undefined}
            title={item.title}
            href={item.href}
            active={isActive}
            isNew={item.isNew}
            isLast={index === items.length - 1}
            onClick={onItemClick ? (event) => onItemClick(item, event) : undefined}
          />
        );
      })}
    </nav>
  );
}

const LineNavItem = memo(function LineNavItem({
  ref,
  title,
  href,
  active = false,
  isNew = false,
  isLast = false,
  onClick,
}: {
  ref?: React.Ref<HTMLAnchorElement>;
  title: string;
  href: string;
  active?: boolean;
  isNew?: boolean;
  isLast?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <>
      <Link
        ref={ref}
        aria-current={active ? "page" : undefined}
        aria-label={isNew ? `${title}, new` : undefined}
        className="group relative flex h-px items-center gap-3 outline-none after:absolute after:top-1/2 after:left-0 after:h-7 after:w-full after:-translate-y-1/2 after:content-['']"
        href={href}
        onClick={onClick}
      >
        <span
          className={cn(
            "block h-px w-10 shrink-0 origin-left scale-x-[0.6] bg-border transition-[transform,background-color] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-x-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-foreground",
            "group-focus-visible:scale-x-100 group-focus-visible:bg-foreground",
            "motion-reduce:transition-none motion-reduce:scale-x-100",
            active && "scale-x-100 bg-foreground",
          )}
        />
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "group-hover:text-foreground group-focus-visible:text-foreground group-aria-[current=page]:text-foreground",
          )}
        >
          {title}
          {isNew ? <NewDot /> : null}
        </span>
      </Link>
      {!isLast ? (
        <>
          <span className="block h-px w-6 bg-border" />
          <span className="block h-px w-6 bg-border" />
        </>
      ) : null}
    </>
  );
});
