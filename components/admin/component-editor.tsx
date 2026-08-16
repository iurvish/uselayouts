"use client";

import { Suspense, useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentLivePreview } from "@/components/admin/live-preview";
import { HintEditor } from "@/components/admin/hint-editor";
import { DependencyTags } from "@/components/admin/dependency-tags";
import { extractHints } from "@/lib/open/mdx-extract";
import {
  DEFAULT_HINT_CONFIG,
  parseHintConfig,
  type InteractionHintConfig,
} from "@/lib/open/hints";
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
  const [previewBackground, setPreviewBackground] = useState("");
  const [hints, setHints] = useState<InteractionHintConfig>(DEFAULT_HINT_CONFIG);

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
        setPreviewBackground(data.controls?.previewBackground ?? "");
        setHints(parseHintConfig(data.controls?.interactionHints));
      })
      .catch((err) => setError(err.message));
  }, [mode, initialName]);

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
      previewBackground: previewBackground.trim() || undefined,
      interactionHints: hints,
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
    if (mode === "create") {
      router.push(`/admin/${data.name}`);
    }
  }

  const Preview = initialName
    ? (Index[initialName]?.component as ComponentType | undefined)
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "New component" : `Edit ${initialName}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Hints live on the platform preview only — they are not written into component code.
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
          onChange={(dependencies) => setForm((f) => ({ ...f, dependencies }))}
        />

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

        <Field label="Preview background">
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Preview background color"
              className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-1"
              value={/^#[0-9a-fA-F]{6}$/.test(previewBackground) ? previewBackground : "#141414"}
              onChange={(e) => setPreviewBackground(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="#141414"
              value={previewBackground}
              onChange={(e) => setPreviewBackground(e.target.value)}
            />
          </div>
        </Field>

        <Field label="Component code">
          <textarea
            required
            rows={22}
            spellCheck={false}
            className={cn(inputClass, "font-mono text-xs leading-relaxed")}
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Submit"}
        </Button>
      </div>

      <div className="space-y-4">
        <ComponentLivePreview code={form.code} />

        <div className="space-y-2">
          <p className="text-sm font-medium">Interaction hints</p>
          <p className="text-xs text-muted-foreground">
            Drag points on the dotted map below. The preview only shows where they land.
          </p>
          <HintEditor value={hints} onChange={setHints}>
            {Preview ? (
              <Suspense
                fallback={
                  <div data-hint-ignore="" className="flex size-24 items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-white/40" />
                  </div>
                }
              >
                <Preview />
              </Suspense>
            ) : (
              <p data-hint-ignore="" className="text-sm text-white/40">
                Save once to preview the live component here.
              </p>
            )}
          </HintEditor>
        </div>
      </div>
    </form>
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
