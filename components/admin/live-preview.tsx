"use client";

import * as React from "react";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  padding?: number;
};

type Status = "idle" | "checking" | "ok" | "error";

/**
 * Admin code validation panel. Full interactive DialKit preview lives on the
 * docs page after submit — this only confirms the TSX parses cleanly.
 */
export function ComponentLivePreview({ code }: Props) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!code.trim()) {
        setStatus("idle");
        setMessage("Paste component code to validate.");
        return;
      }

      setStatus("checking");
      try {
        const Babel = (await import("@babel/standalone")).default;
        Babel.transform(code, {
          presets: [["react", { runtime: "classic" }], "typescript"],
          plugins: ["syntax-jsx"],
          filename: "component.tsx",
        });
        if (!cancelled) {
          setStatus("ok");
          setMessage(
            "Syntax looks good. Submit to generate MDX — live DialKit preview will appear on the docs page.",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err instanceof Error ? err.message : "Preview failed");
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  return (
    <div
      className={cn(
        "relative flex min-h-[220px] flex-col justify-center gap-3 overflow-hidden rounded-lg border bg-muted/20 p-6",
        status === "ok" && "border-emerald-500/30",
        status === "error" && "border-destructive/40",
      )}
    >
      <div className="flex items-start gap-3">
        {status === "checking" && (
          <Loader2Icon className="mt-0.5 size-5 shrink-0 animate-spin text-muted-foreground" />
        )}
        {status === "ok" && (
          <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
        )}
        {status === "error" && (
          <XCircleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
        )}
        {status === "idle" && (
          <div className="mt-0.5 size-5 shrink-0 rounded-full border border-dashed border-muted-foreground/40" />
        )}
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">
            {status === "checking" && "Validating code…"}
            {status === "ok" && "Ready to submit"}
            {status === "error" && "Syntax error"}
            {status === "idle" && "Preview"}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {message || "Paste component code to validate."}
          </p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/80">
        Admin can&apos;t run dialkit/motion inside this panel. Use the docs
        Preview tab after save for the real interactive preview.
      </p>
    </div>
  );
}
