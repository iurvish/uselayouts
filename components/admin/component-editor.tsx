"use client";

import { Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentLivePreview } from "@/components/admin/live-preview";
import { DependencyTags } from "@/components/admin/dependency-tags";
import { detectComponentName, detectDependencies } from "@/lib/admin/detect-code";
import { extractHints } from "@/lib/open/mdx-extract";
import {
  DEFAULT_PREVIEW_BACKGROUNDS,
  parsePreviewBackgrounds,
  resolvePreviewBackground,
  serializePreviewBackgrounds,
} from "@/lib/open/preview-background";
import { Index } from "@/registry/__index__";

type FormState = {
  name: string;
  title: string;
  description: string;
  code: string;
  dependencies: string;
  features: string;
};

const EMPTY: FormState = {
  name: "",
  title: "",
  description: "",
  code: `"use client";

import { motion } from "motion/react";

export default function Example() {
  return (
    <motion.div className="flex flex-col items-center gap-4 p-8">
      <p className="text-lg font-medium">Hello</p>
    </motion.div>
  );
}
`,
  dependencies: "motion, clsx, tailwind-merge",
  features: "Motion-powered interactions",
};

export function ComponentEditor({
  mode,
  initialName,
}: {
  mode: "create" | "edit";
  initialName?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewBgLight, setPreviewBgLight] = useState<string>(DEFAULT_PREVIEW_BACKGROUNDS.light);
  const [previewBgDark, setPreviewBgDark] = useState<string>(DEFAULT_PREVIEW_BACKGROUNDS.dark);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");
  const [previewKey, setPreviewKey] = useState(0);
  const [depsLocked, setDepsLocked] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !initialName) return;
    fetch(`/api/admin/components/${initialName}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setForm({
          name: data.item.name,
          title: data.item.title,
          description: data.item.description,
          code: data.code,
          dependencies: (data.item.dependencies || []).join(", "),
          features: data.mdx ? extractHints(data.mdx).join("\n") : "",
        });
        setDepsLocked(true);
        const backgrounds = parsePreviewBackgrounds(data.controls?.previewBackground);
        setPreviewBgLight(backgrounds.light ?? DEFAULT_PREVIEW_BACKGROUNDS.light);
        setPreviewBgDark(backgrounds.dark ?? DEFAULT_PREVIEW_BACKGROUNDS.dark);
      })
      .catch((err) => setError(err.message));
  }, [mode, initialName]);

  // Auto-detect package imports from pasted / edited source.
  useEffect(() => {
    if (depsLocked && mode === "edit") return;
    const timer = window.setTimeout(() => {
      const detected = detectDependencies(form.code);
      if (detected.length === 0) return;
      setForm((current) => {
        const existing = current.dependencies
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
        if (existing.length > 0 && depsLocked) return current;
        const merged = Array.from(new Set([...existing, ...detected])).sort((a, b) =>
          a.localeCompare(b),
        );
        const next = merged.join(", ");
        if (next === current.dependencies) return current;
        return { ...current, dependencies: next };
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form.code, depsLocked, mode]);

  // Auto-fill title from exported component name when empty.
  useEffect(() => {
    if (mode !== "create") return;
    if (form.title.trim()) return;
    const detected = detectComponentName(form.code);
    if (!detected) return;
    const title = detected.replace(/([a-z])([A-Z])/g, "$1 $2");
    setForm((current) => ({ ...current, title }));
  }, [form.code, form.title, mode]);

  const activePreviewBackground = useMemo(
    () =>
      resolvePreviewBackground(
        { light: previewBgLight, dark: previewBgDark },
        previewTheme,
      ),
    [previewBgLight, previewBgDark, previewTheme],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      name: form.name || undefined,
      title: form.title,
      description: form.description,
      code: form.code,
      dependencies: form.dependencies
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      features: form.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      previewBackground: serializePreviewBackgrounds({
        light: previewBgLight,
        dark: previewBgDark,
      }),
    };

    const res = await fetch(
      mode === "edit" && initialName
        ? `/api/admin/components/${initialName}`
        : "/api/admin/components",
      {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }

    setMessage(`Saved ${data.name}.`);
    setPreviewKey((key) => key + 1);
    setDepsLocked(true);
    router.refresh();
    if (mode === "create") {
      router.push(`/admin/${data.name}`);
    }
  }

  const previewName = initialName || form.name.trim() || undefined;
  const Preview = previewName
    ? (Index[previewName]?.component as ComponentType<{ size?: string }> | undefined)
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "New component" : `Edit ${initialName}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste component code — dependencies and title are auto-detected. Save once to publish the live preview.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <input
              required
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field label="Slug (optional)">
            <input
              className={inputClass}
              placeholder="auto-from-title"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={mode === "edit"}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            required
            rows={2}
            className={inputClass}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </Field>

        <DependencyTags
          value={form.dependencies}
          onChange={(dependencies) => {
            setDepsLocked(true);
            setForm((f) => ({ ...f, dependencies }));
          }}
        />
        <p className="-mt-2 text-[11px] text-muted-foreground">
          Auto-detected from imports. Edit anytime to lock the list.
        </p>

        <Field label="Features (one per line)">
          <textarea
            rows={3}
            className={inputClass}
            value={form.features}
            onChange={(e) =>
              setForm((f) => ({ ...f, features: e.target.value }))
            }
          />
        </Field>

        <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-sm font-medium">Preview backgrounds</p>
          <p className="text-xs text-muted-foreground">
            Separate colors for light and dark open-page themes.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField
              label="Light"
              value={previewBgLight}
              fallback={DEFAULT_PREVIEW_BACKGROUNDS.light}
              onChange={setPreviewBgLight}
            />
            <ColorField
              label="Dark"
              value={previewBgDark}
              fallback={DEFAULT_PREVIEW_BACKGROUNDS.dark}
              onChange={setPreviewBgDark}
            />
          </div>
        </div>

        <Field label="Component code">
          <textarea
            required
            rows={22}
            spellCheck={false}
            className={cn(inputClass, "font-mono text-xs leading-relaxed")}
            value={form.code}
            onChange={(e) => {
              setDepsLocked(false);
              setForm((f) => ({ ...f, code: e.target.value }));
            }}
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Submit"}
        </Button>
      </div>

      <div className="min-w-0 space-y-4">
        <ComponentLivePreview code={form.code} />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Live component preview</p>
              <p className="text-xs text-muted-foreground">
                Shows the published registry component after save.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-border bg-background p-1">
              {(["light", "dark"] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                    previewTheme === theme
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setPreviewTheme(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "flex min-h-[min(70vh,720px)] items-center justify-center overflow-hidden rounded-[14px] border border-border",
              previewTheme === "dark" ? "dark" : "light",
            )}
            style={{ background: activePreviewBackground }}
          >
            {Preview ? (
              <Suspense
                fallback={
                  <div className="flex size-24 items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <div key={previewKey} className="flex h-full w-full items-center justify-center p-4">
                  <Preview size="lg" />
                </div>
              </Suspense>
            ) : (
              <p className="max-w-sm px-6 text-center text-sm text-muted-foreground">
                Paste your component code and click Submit once. The live preview appears here automatically after save.
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} preview background`}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-1"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder={fallback}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
