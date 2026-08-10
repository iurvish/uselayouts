"use client";

import * as React from "react";
import { useDialKit } from "dialkit";
import { DialStore } from "dialkit/store";
import { Index } from "@/registry/__index__";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { isLocalImageValue } from "@/lib/admin/dial-extract";
import { useDialPreview } from "@/components/dial-preview-context";

interface ComponentPreviewProps extends React.ComponentProps<"div"> {
  name?: string;
  align?: "center" | "start" | "end";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  full?: boolean;
}

const PREVIEW_DIAL = {
  padding: [24, 0, 96, 4],
  background: {
    type: "select" as const,
    options: ["transparent", "muted", "card", "dots"],
    default: "transparent",
  },
};

export function ComponentPreview({
  name,
  children,
  className,
  align = "center",
  size = "md",
  full = false,
  ...props
}: ComponentPreviewProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { setActive } = useDialPreview();
  const Component = React.useMemo(() => {
    if (!name) return null;
    return Index[name]?.component;
  }, [name]);

  const frame = useDialKit("Preview", PREVIEW_DIAL, {
    id: name ? `preview-frame-${name}` : "preview-frame",
  });

  const [exportMessage, setExportMessage] = React.useState<string | null>(null);
  const [localImageWarning, setLocalImageWarning] = React.useState(false);

  React.useEffect(() => {
    const root = rootRef.current;
    const panel = root?.closest('[role="tabpanel"]') as HTMLElement | null;

    const sync = () => {
      if (!panel) {
        setActive(true);
        return;
      }
      const state = panel.getAttribute("data-state");
      const hidden =
        panel.hasAttribute("hidden") ||
        panel.getAttribute("aria-hidden") === "true" ||
        state === "inactive" ||
        getComputedStyle(panel).display === "none";
      setActive(!hidden);
    };

    sync();
    if (!panel) {
      return () => setActive(false);
    }

    const observer = new MutationObserver(sync);
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ["data-state", "hidden", "aria-hidden", "class", "style"],
    });
    return () => {
      observer.disconnect();
      setActive(false);
    };
  }, [setActive]);

  React.useEffect(() => {
    if (!name) return;
    const unsub = DialStore.subscribeGlobal(() => {
      const panel = DialStore.getPanels().find(
        (p) =>
          p.id === name ||
          p.name.toLowerCase().replace(/\s+/g, "-") === name,
      );
      if (!panel) return;
      const values = DialStore.getValues(panel.id);
      const hasLocal = Object.values(values).some((v) => isLocalImageValue(v));
      setLocalImageWarning(hasLocal);
    });
    return unsub;
  }, [name]);

  async function handleExport() {
    if (!name) return;
    setExportMessage(null);

    const panels = DialStore.getPanels();
    const componentPanel = panels.find(
      (p) =>
        p.id === name ||
        p.name.toLowerCase().replace(/\s+/g, "-") === name ||
        p.name === Index[name]?.name,
    );

    const values = componentPanel
      ? DialStore.getValues(componentPanel.id)
      : {};

    const localKeys = Object.entries(values)
      .filter(([, v]) => isLocalImageValue(v))
      .map(([k]) => k);

    if (localKeys.length) {
      setExportMessage(
        `Local images are not exportable (${localKeys.join(", ")}). Use HTTPS URLs instead.`,
      );
    }

    const res = await fetch(`/api/components/${name}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });
    const data = await res.json();
    if (!res.ok) {
      setExportMessage(data.error || "Export failed");
      return;
    }

    await navigator.clipboard.writeText(data.code);
    setExportMessage(
      localKeys.length
        ? "Copied code with remote values. Local image fields were skipped."
        : "Copied customized component code.",
    );
  }

  const bgClass =
    frame.background === "muted"
      ? "bg-muted"
      : frame.background === "card"
        ? "bg-card"
        : frame.background === "dots"
          ? "bg-[radial-gradient(circle_at_1px_1px,theme(colors.border)_1px,transparent_0)] bg-size-[16px_16px]"
          : "bg-transparent";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex w-full min-w-0 flex-col gap-3 not-prose text-base leading-normal text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleExport}
        >
          Export customized code
        </Button>
        {localImageWarning && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Local/blob images won&apos;t be included in export — use a URL.
          </span>
        )}
        {exportMessage && (
          <span className="text-xs text-muted-foreground">{exportMessage}</span>
        )}
      </div>
      <div
        className={cn(
          "relative flex w-full overflow-hidden rounded-xl border text-foreground",
          bgClass,
          !full ? "min-h-[400px]" : "min-h-[300px] p-0",
          align === "center" && "items-center justify-center",
          align === "start" && "items-start justify-center",
          align === "end" && "items-end justify-center",
        )}
        style={{ padding: frame.padding }}
      >
        <React.Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          {Component ? (
            <Component size={size} />
          ) : (
            React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { size } as object);
              }
              return child;
            })
          )}
        </React.Suspense>
      </div>
    </div>
  );
}
