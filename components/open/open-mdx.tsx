import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

function Heading({
  as: Comp,
  className,
  ...props
}: ComponentPropsWithoutRef<"h2"> & { as: "h2" | "h3" | "h4" }) {
  return (
    <Comp
      className={cn(
        "mt-7 mb-3.5 font-semibold tracking-tight text-foreground text-balance",
        Comp === "h2" && "text-2xl",
        Comp === "h3" && "text-xl",
        Comp === "h4" && "text-lg",
        className,
      )}
      {...props}
    />
  );
}

/** Minimal MDX map — fumadocs for compile/load, custom UI only. */
export function getOpenMdxComponents(components?: MDXComponents): MDXComponents {
  return {
    h1: (props) => <Heading as="h2" {...props} />,
    h2: (props) => <Heading as="h2" {...props} />,
    h3: (props) => <Heading as="h3" {...props} />,
    h4: (props) => <Heading as="h4" {...props} />,
    p: ({ className, ...props }) => (
      <p
        className={cn("mb-3 text-sm leading-relaxed text-muted-foreground", className)}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={cn(
          "mb-3 grid list-disc gap-2 pl-[18px] text-sm leading-relaxed text-muted-foreground",
          className,
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn(
          "mb-3 grid list-decimal gap-2 pl-[18px] text-sm leading-relaxed text-muted-foreground",
          className,
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("leading-relaxed", className)} {...props} />
    ),
    strong: ({ className, ...props }) => (
      <strong className={cn("font-semibold text-foreground", className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a
        className={cn(
          "font-medium text-foreground underline decoration-foreground/25 underline-offset-3 hover:decoration-foreground/60",
          className,
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn(
          "rounded-md bg-muted px-1.5 py-[0.12em] font-mono text-[0.9em] text-foreground",
          className,
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "mb-3 overflow-x-auto rounded-xl border border-border bg-muted/60 p-3 text-[12.5px] leading-relaxed text-foreground",
          className,
        )}
        {...props}
      />
    ),
    ...components,
  };
}
