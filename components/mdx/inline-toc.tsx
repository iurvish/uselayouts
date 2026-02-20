"use client";

import {
  ArrowDown01Icon,
  TextAlignLeftIcon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type TOCItemType } from "fumadocs-core/toc";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type ComponentProps, useState } from "react";
import { cn } from "@/lib/cn";

export interface InlineTocProps
  extends Omit<ComponentProps<typeof Collapsible>, "className"> {
  items: TOCItemType[];
  className?: string;
}

export function InlineTOC({ items, ...props }: InlineTocProps) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);

  return (
    <Collapsible
      {...props}
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "not-prose border-b border-t z-50 border-fd-border bg-background/80 backdrop-blur-md text-fd-foreground",
        props.className
      )}
    >
      <CollapsibleTrigger className="group inline-flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            aria-hidden="true"
            icon={TextAlignLeftIcon}
            size={16}
          />
          <span className="truncate">
            {props.children ?? "Table of Contents"}
          </span>
        </div>
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          className="size-5 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col px-4 py-2 text-sm border-t border-fd-border/50 max-h-[50vh] overflow-y-auto">
          {items.map((item) => (
            <a
              key={item.url}
              href={item.url}
              onClick={() => setOpen(false)}
              className="py-1.5 text-fd-muted-foreground hover:text-fd-foreground transition-colors"
              style={{
                paddingInlineStart: 12 * Math.max(item.depth - 1, 0),
              }}
            >
              {item.title}
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
