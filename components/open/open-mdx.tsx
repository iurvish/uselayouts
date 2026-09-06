import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

import { DocsCodeBlock } from "@/components/open/docs-code-block";
import { highlightCode } from "@/lib/open/highlight";
import { extractMdxPreLang, extractMdxPreText } from "@/lib/open/mdx-pre-text";
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

/** Fenced MDX → same Shiki + Copy Code surface as the main panel. */
async function OpenMdxPre({
  children,
  title,
  componentSlug,
  "data-language": dataLanguage,
}: ComponentPropsWithoutRef<"pre"> & {
  title?: string;
  componentSlug?: string;
  "data-language"?: string;
}) {
  const code = extractMdxPreText(children).replace(/\n$/, "");
  const lang =
    (typeof dataLanguage === "string" && dataLanguage) ||
    extractMdxPreLang(children) ||
    "tsx";
  const html = await highlightCode(code, lang, { showLineNumbers: false });

  return (
    <div className="mb-3 min-w-0">
      <DocsCodeBlock
        html={html}
        code={code}
        language={lang}
        title={title}
        withWrapper={false}
        className="pb-14"
        componentSlug={componentSlug}
      />
    </div>
  );
}

/** Minimal MDX map — fumadocs for compile/load, open UI for fenced code. */
export function getOpenMdxComponents(
  components?: MDXComponents,
  options?: { componentSlug?: string },
): MDXComponents {
  const componentSlug = options?.componentSlug;

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
    pre: (props) => <OpenMdxPre componentSlug={componentSlug} {...props} />,
    ...components,
  };
}
