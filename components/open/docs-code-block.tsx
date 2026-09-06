"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import * as React from "react";

import { openPressMotion, scrollbarNone } from "@/components/open/ui";
import { useGatedCopy } from "@/hooks/use-gated-copy";
import { stripCodeAnnotations } from "@/lib/open/strip-code-annotations";
import { cn } from "@/lib/utils";

/** Figma 111:2982 / 120:164 — code card with floating Copy Code */
export function DocsCodeBlock({
  html,
  code,
  title,
  language = "tsx",
  className,
  wrapperClassName,
  copyButton = true,
  withWrapper = true,
  compact = false,
  componentSlug,
}: {
  html: string;
  code: string;
  title?: string;
  language?: string;
  className?: string;
  wrapperClassName?: string;
  copyButton?: boolean;
  withWrapper?: boolean;
  /** Shorter card for nested manual step 2 */
  compact?: boolean;
  componentSlug?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const cleaned = stripCodeAnnotations(code);
  const gatedCopy = useGatedCopy({
    componentSlug,
    source: "code",
  });

  async function copy() {
    try {
      const ok = await gatedCopy(cleaned);
      if (!ok) return;
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const body = (
    <>
      {/* Figma 111:2921 — py 12 on panel; lines use px 16; no scrollbar (system accent looked like a blue stripe) */}
      <div
        className={cn(
          "h-full min-w-0 cursor-pointer overflow-auto px-4 py-3 outline-none",
          "[&_pre]:m-0 [&_pre]:min-w-0 [&_pre]:cursor-pointer [&_pre]:overflow-x-auto [&_pre]:bg-transparent",
          "[&_code]:bg-transparent [&_.shiki]:bg-transparent [&_.shiki]:font-mono [&_.shiki]:text-[13px] [&_.shiki]:leading-[19.5px] [&_.shiki_span]:!bg-transparent",
          scrollbarNone,
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html || "<pre><code>No source yet.</code></pre>" }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[84px] bg-linear-to-t from-[hsl(240_6%_20%)] to-transparent" />
    </>
  );

  /* Paper 12K-0 — Copy Code: #19191A, py 6 / px 12, radius 12, gap 10, inset shadows */
  const floatingCopy = copyButton ? (
    <div className="pointer-events-none absolute inset-x-0 bottom-[17px] z-[2] flex justify-center">
      <button
        type="button"
        className={cn(
          "pointer-events-auto relative inline-flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl bg-[#19191a] px-3 py-1.5 text-base leading-[25px] text-white",
          "shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(255,255,255,0.1)]",
          openPressMotion,
        )}
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy Code"}
      >
        <img
          src={copied ? "/open/check.svg" : "/open/copy-white-18.svg"}
          alt=""
          width={18}
          height={18}
          className="size-[18px] shrink-0"
        />
        <span className="shrink-0">{copied ? "Copied" : "Copy Code"}</span>
      </button>
    </div>
  ) : null;

  if (withWrapper) {
    return (
      <div
        className={cn(
          /* Figma 111:2982 — outer #232328, radius 14 */
          "flex min-w-0 flex-col overflow-hidden rounded-[14px] bg-[hsl(240_6%_15%)]",
          compact ? "h-[286px]" : "h-[466px]",
          wrapperClassName,
        )}
      >
        {/* Figma 111:2983 — pl 16 / pr 6 / py 10 */}
        <div className="flex shrink-0 items-center justify-between py-2.5 pr-1.5 pl-4">
          <figcaption
            className="flex min-w-0 items-center gap-2.5 text-base tracking-[-0.16px] text-[hsl(240_5%_69%)]"
            data-language={language}
          >
            <img src="/open/file.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
            <span className="truncate">{title ?? "component.tsx"}</span>
          </figcaption>
        </div>
        {/* Figma 111:3037 — p 4 around inner panel */}
        <div className="relative min-h-0 min-w-0 flex-1 p-1">
          <figure
            data-rehype-pretty-code-figure=""
            className="relative h-full min-w-0 cursor-pointer overflow-hidden rounded-[10px] bg-[hsl(240_6%_20%)] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.32),0_0_0_1px_rgba(255,255,255,0.1),0_-1px_0_0_rgba(255,255,255,0.04)] outline-none"
          >
            {body}
            {floatingCopy}
          </figure>
        </div>
      </div>
    );
  }

  return (
    <figure
      className="relative overflow-hidden rounded-[10px] bg-[hsl(240_6%_20%)] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.32),0_0_0_1px_rgba(255,255,255,0.1)]"
      data-rehype-pretty-code-figure=""
    >
      {title ? (
        <figcaption className="flex items-center gap-2.5 px-4 py-2.5 text-base text-[hsl(240_5%_69%)]">
          <img src="/open/file.svg" alt="" width={16} height={16} className="size-4" />
          <span>{title}</span>
        </figcaption>
      ) : null}
      {body}
      {floatingCopy}
    </figure>
  );
}
