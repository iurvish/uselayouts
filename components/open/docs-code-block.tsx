"use client";

import * as React from "react";
import { Check, Copy, FileCode2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function DocsCodeBlock({
  html,
  code,
  title,
  maxLines = 16,
}: {
  html: string;
  code: string;
  title?: string;
  maxLines?: number;
}) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const lines = code.split("\n").length;
  const collapsible = lines > maxLines;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("docs-code", collapsible && !expanded && "is-collapsed")}>
      <div className="docs-code-bar">
        <span className="docs-code-title">
          <FileCode2 className="size-3.5" strokeWidth={1.75} />
          {title ?? "component.tsx"}
        </span>
        <button type="button" className="docs-copy" onClick={copy} aria-label={copied ? "Copied" : "Copy"}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div
        className="docs-code-body"
        style={collapsible && !expanded ? { maxHeight: maxLines * 22 } : undefined}
        dangerouslySetInnerHTML={{ __html: html || "<pre><code>No source yet.</code></pre>" }}
      />
      {collapsible ? (
        <button type="button" className="docs-expand" onClick={() => setExpanded((open) => !open)}>
          {expanded ? "Collapse" : "Expand"}
        </button>
      ) : null}
    </div>
  );
}
