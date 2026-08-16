"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { IconSwap, IconSwapItem } from "@/components/open/icon-swap";
import { openCopyBtn, scrollbarMinimal } from "@/components/open/ui";
import { stripCodeAnnotations } from "@/lib/open/strip-code-annotations";
import { cn } from "@/lib/utils";

function LanguageFileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path
        d="M4.2 1.5h5.1L13 5.2v8.3c0 .8-.7 1.5-1.5 1.5h-7.3c-.8 0-1.5-.7-1.5-1.5V3c0-.8.7-1.5 1.5-1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M9.2 1.6v3.1c0 .5.4.9.9.9H13" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function DocsCodeBlock({
  html,
  code,
  title,
  language = "tsx",
  className,
  wrapperClassName,
  copyButton = true,
  withWrapper = true,
  maxLines = 16,
}: {
  html: string;
  code: string;
  title?: string;
  language?: string;
  className?: string;
  wrapperClassName?: string;
  copyButton?: boolean;
  withWrapper?: boolean;
  maxLines?: number;
}) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const cleaned = stripCodeAnnotations(code);
  const lines = cleaned.split("\n").length;
  const collapsible = lines > maxLines;

  async function copy() {
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const copyControl = copyButton ? (
    <button type="button" className={openCopyBtn} onClick={copy} aria-label={copied ? "Copied" : "Copy"}>
      <IconSwap>
        {copied ? (
          <IconSwapItem key="copied" className="flex items-center gap-1.5">
            <Check className="size-3.5" strokeWidth={1.75} />
            Copied
          </IconSwapItem>
        ) : (
          <IconSwapItem key="copy" className="flex items-center gap-1.5">
            <Copy className="size-3.5" strokeWidth={1.75} />
            Copy
          </IconSwapItem>
        )}
      </IconSwap>
    </button>
  ) : null;

  const body = (
    <>
      <div
        className={cn(
          "overflow-auto px-4 pt-3.5 pb-5 [&_pre]:bg-transparent [&_code]:bg-transparent [&_.shiki]:bg-transparent [&_.shiki]:font-mono [&_.shiki]:text-[12.5px] [&_.shiki]:leading-[1.7]",
          scrollbarMinimal,
          className,
        )}
        style={collapsible && !expanded ? { maxHeight: maxLines * 22 } : undefined}
        dangerouslySetInnerHTML={{ __html: html || "<pre><code>No source yet.</code></pre>" }}
      />
      {collapsible && !expanded ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[88px] bg-linear-to-t from-[#0a0a0a] to-transparent" />
      ) : null}
      {collapsible ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-[2] flex justify-center">
          <button
            type="button"
            className="pointer-events-auto h-7 rounded-lg border border-white/14 bg-[#1a1a1a] px-2.5 text-xs text-[#f0f0f0] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/8 [@media(hover:hover)_and_(pointer:fine)]:active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      ) : null}
    </>
  );

  if (withWrapper) {
    return (
      <div className={cn("my-3 mb-2 rounded-[10px] bg-[#161616] p-1", wrapperClassName)}>
        <div className="flex h-7 items-center justify-between px-1">
          <figcaption className="flex items-center gap-2 text-xs text-[#a3a3a3]" data-language={language}>
            <LanguageFileIcon className="size-3.5" />
            <span className="font-mono">{title ?? "component.tsx"}</span>
          </figcaption>
          {copyControl}
        </div>
        <figure data-rehype-pretty-code-figure="" className="relative overflow-hidden rounded-lg border border-white/12 bg-[#0a0a0a]">
          {body}
        </figure>
      </div>
    );
  }

  return (
    <figure
      className="relative overflow-hidden rounded-lg border border-white/12 bg-[#0a0a0a]"
      data-rehype-pretty-code-figure=""
    >
      {title ? (
        <figcaption className="flex items-center gap-2 text-xs text-[#a3a3a3]" data-language={language}>
          <LanguageFileIcon className="size-3.5" />
          <span className="font-mono">{title}</span>
        </figcaption>
      ) : null}
      {copyButton ? <div className="sticky top-0 z-10 flex h-0 justify-end">{copyControl}</div> : null}
      {body}
    </figure>
  );
}
