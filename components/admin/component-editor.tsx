"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExtractedControl } from "@/lib/admin/dial-extract";
import { ComponentLivePreview } from "@/components/admin/live-preview";

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

import { useDialKit } from "dialkit";
import { motion } from "motion/react";

export const dialConfig = {
  title: "Hello",
  scale: [1, 0.8, 1.4, 0.01],
  color: "#ffffff",
  imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
  spring: {
    type: "spring",
    visualDuration: 0.35,
    bounce: 0.2,
  },
} as const;

export default function Example() {
  const params = useDialKit("Example", dialConfig);

  return (
    <motion.div
      className="flex flex-col items-center gap-4 p-8"
      animate={{ scale: params.scale }}
      transition={params.spring}
    >
      <img
        src={params.imageUrl}
        alt=""
        className="size-24 rounded-2xl object-cover"
      />
      <p style={{ color: params.color }} className="text-lg font-medium">
        {params.title}
      </p>
    </motion.div>
  );
}
`,
  dependencies: "motion, dialkit, clsx, tailwind-merge",
  features: "DialKit live controls\nMotion spring animation",
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
  const [controls, setControls] = useState<ExtractedControl[]>([]);
  const [disabled, setDisabled] = useState<string[]>([]);
  const [dialConfig, setDialConfig] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewPadding, setPreviewPadding] = useState(24);

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
          features: "",
        });
        setDisabled(data.controls?.disabled ?? []);
        setDialConfig(data.controls?.dialConfig ?? {});
      })
      .catch((err) => setError(err.message));
  }, [mode, initialName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!form.code.trim()) return;
      fetch("/api/admin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: form.code }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) return;
          setControls(data.controls);
          setDialConfig(data.dialConfig);
        })
        .catch(() => undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [form.code]);

  const leafControls = useMemo(
    () => controls.filter((c) => c.kind !== "folder"),
    [controls],
  );

  function toggleControl(path: string) {
    setDisabled((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  }

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
      dialConfig,
      disabledControls: disabled,
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

    setMessage(`Saved ${data.name}. MDX + registry updated.`);
    if (mode === "create") {
      router.push(`/admin/${data.name}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "New component" : `Edit ${initialName}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste component code with <code>dialConfig</code> +{" "}
            <code>useDialKit</code>. Controls are extracted automatically.
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

        <Field label="Dependencies (comma separated)">
          <input
            className={inputClass}
            value={form.dependencies}
            onChange={(e) =>
              setForm((f) => ({ ...f, dependencies: e.target.value }))
            }
          />
        </Field>

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
          {saving ? "Saving…" : "Submit · generate MDX"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Preview frame</p>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Padding
              <input
                type="range"
                min={0}
                max={96}
                value={previewPadding}
                onChange={(e) => setPreviewPadding(Number(e.target.value))}
              />
              <span>{previewPadding}px</span>
            </label>
          </div>
          <ComponentLivePreview code={form.code} padding={previewPadding} />
          <p className="mt-2 text-xs text-muted-foreground">
            Live transpile preview for admin. After submit, docs use the
            registry component + DialKit panel.
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm font-medium">DialKit controls</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Uncheck to cancel a control so it won&apos;t ship in the component
            dialConfig.
          </p>
          <ul className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
            {leafControls.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No controls detected yet.
              </li>
            )}
            {leafControls.map((control) => {
              const checked = !disabled.includes(control.path);
              return (
                <li
                  key={control.path}
                  className="flex items-start gap-3 rounded-lg border px-3 py-2"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={() => toggleControl(control.path)}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{control.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {control.path} · {control.kind}
                      {control.kind === "image"
                        ? " · URL only on export"
                        : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
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
