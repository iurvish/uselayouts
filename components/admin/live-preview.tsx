"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  padding?: number;
};

/**
 * Admin-only approximate preview. Full DialKit preview appears on the docs
 * page after submit. This panel shows a transpile status + isolated iframe
 * attempt for simple default-export components.
 */
export function ComponentLivePreview({ code, padding = 24 }: Props) {
  const [error, setError] = React.useState<string | null>(null);
  const [html, setHtml] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const Babel = (await import("@babel/standalone")).default;
        const transformed = Babel.transform(code, {
          presets: [
            ["react", { runtime: "classic" }],
            ["typescript", { isTSX: true, allExtensions: true }],
          ],
          filename: "component.tsx",
        }).code;

        if (!transformed) throw new Error("Transform returned empty code");

        const srcDoc = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://unpkg.com/react@19.2.6/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@19.2.6/umd/react-dom.development.js"><\/script>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    html, body, #root { height: 100%; margin: 0; background: #0a0a0a; color: white; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="root" style="padding:${padding}px;display:flex;align-items:center;justify-content:center;min-height:100%;box-sizing:border-box;"></div>
  <script>
    window.__PREVIEW_ERROR__ = null;
    try {
      ${transformed}
      const Comp = typeof Example !== 'undefined' ? Example
        : (typeof exports !== 'undefined' && exports.default)
        || (typeof module !== 'undefined' && module.exports && module.exports.default);
    } catch (e) {
      window.__PREVIEW_ERROR__ = e.message;
    }
  <\/script>
  <script>
    const root = document.getElementById('root');
    if (window.__PREVIEW_ERROR__) {
      root.innerHTML = '<pre style="color:#f87171;white-space:pre-wrap;font-size:12px;">' + window.__PREVIEW_ERROR__ + '</pre>';
    } else {
      root.innerHTML = '<p style="opacity:.6;font-size:13px;text-align:center;max-width:280px">Code transforms OK. Interactive DialKit preview is available on the docs page after submit (iframe cannot load dialkit/motion modules).</p>';
    }
  <\/script>
</body>
</html>`;

        if (!cancelled) {
          setHtml(srcDoc);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Preview failed");
          setHtml("");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [code, padding]);

  return (
    <div
      className={cn(
        "relative min-h-[280px] overflow-hidden rounded-lg border bg-background",
      )}
    >
      {error ? (
        <pre className="whitespace-pre-wrap p-4 text-xs text-destructive">
          {error}
        </pre>
      ) : (
        <iframe
          title="Component preview"
          className="h-[320px] w-full border-0"
          sandbox="allow-scripts"
          srcDoc={html}
        />
      )}
    </div>
  );
}
