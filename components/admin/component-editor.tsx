"use client";

import { Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

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
        setPosterUrl(data.controls?.posterUrl ?? null);
        setVideoUrl(data.controls?.videoUrl ?? null);
      })
      .catch((err) => setError(err.message));
  }, [mode, initialName]);

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

  async function handleMediaUpload() {
    const slug = initialName || form.name.trim();
    if (!slug) {
      setError("Save the component first, then upload browse media.");
      return;
    }
    if (!imageFile && !videoFile) {
      setError("Choose an image and/or video to upload.");
      return;
    }

    setUploadingMedia(true);
    setError(null);
    setMessage(null);

    const body = new FormData();
    if (imageFile) body.append("image", imageFile);
    if (videoFile) body.append("video", videoFile);

    const res = await fetch(`/api/admin/components/${slug}/media`, {
      method: "POST",
      body,
    });
    const data = await res.json();
    setUploadingMedia(false);

    if (!res.ok) {
      setError(data.error || "Media upload failed");
      return;
    }

    setPosterUrl(data.posterUrl ?? null);
    setVideoUrl(data.videoUrl ?? null);
    setImageFile(null);
    setVideoFile(null);
    setMessage("Browse media uploaded to R2.");
    router.refresh();
  }

  const previewName = initialName || form.name.trim() || undefined;
  const mediaSlug = mode === "edit" ? initialName : undefined;
  const Preview = previewName
    ? (Index[previewName]?.component as ComponentType<{ size?: string }> | undefined)
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 w-fit text-muted-foreground",
            )}
          >
            <ArrowLeft data-icon="inline-start" />
            All components
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "create" ? "New component" : form.title || initialName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "create"
                ? "Paste source — title and dependencies auto-detect. Save once to publish the live preview."
                : `Editing ${initialName}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {mode === "edit" && initialName ? (
            <Link
              href={`/docs/components/${initialName}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View open page
            </Link>
          ) : null}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
          </Button>
        </div>
      </div>

      {(error || message) && (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            error
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/5 text-emerald-700",
          )}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Basics</CardTitle>
              <CardDescription>Name and copy shown on browse / open.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </Field>
                <Field label="Slug">
                  <Input
                    placeholder="auto-from-title"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    disabled={mode === "edit"}
                  />
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
              <CardDescription>
                Auto-detected from imports. Edit to lock the list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DependencyTags
                value={form.dependencies}
                onChange={(dependencies) => {
                  setDepsLocked(true);
                  setForm((f) => ({ ...f, dependencies }));
                }}
              />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>One perk per line — used when generating MDX.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={3}
                placeholder={"Motion-powered interactions\nAccessible keyboard support"}
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
              />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Preview backgrounds</CardTitle>
              <CardDescription>Light and dark colors for the open-page canvas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
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
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Browse media</CardTitle>
              <CardDescription>
                Poster + video for browse cards (R2). Video is re-encoded H.264 ≤1080p.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!mediaSlug ? (
                <p className="text-sm text-muted-foreground">
                  Save the component first, then upload media from the edit page.
                </p>
              ) : (
                <>
                  <div className="grid gap-4">
                    <Field label="Poster image">
                      <Input
                        type="file"
                        accept="image/*"
                        className="h-auto py-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
                        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      />
                    </Field>
                    <Field label="Preview video">
                      <Input
                        type="file"
                        accept="video/*"
                        className="h-auto py-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
                        onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                      />
                    </Field>
                  </div>
                  {(posterUrl || videoUrl) && (
                    <div className="space-y-1 break-all rounded-lg bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                      {posterUrl && <p>Poster: {posterUrl}</p>}
                      {videoUrl && <p>Video: {videoUrl}</p>}
                    </div>
                  )}
                  {posterUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- admin preview of CDN poster
                    <img
                      src={posterUrl}
                      alt=""
                      className="h-28 w-full rounded-lg border border-border object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={uploadingMedia || (!imageFile && !videoFile)}
                    onClick={handleMediaUpload}
                  >
                    {uploadingMedia ? "Uploading…" : "Upload to R2"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Source</CardTitle>
              <CardDescription>Component TSX written to the registry on save.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                required
                rows={18}
                spellCheck={false}
                className="min-h-[280px] font-mono text-xs leading-relaxed md:text-xs"
                value={form.code}
                onChange={(e) => {
                  setDepsLocked(false);
                  setForm((f) => ({ ...f, code: e.target.value }));
                }}
              />
            </CardContent>
          </Card>

          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 p-3 shadow-sm backdrop-blur">
            <p className="text-xs text-muted-foreground">
              {mode === "create" ? "Creates files + MDX locally." : "Writes files in place."}
            </p>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
          <ComponentLivePreview code={form.code} />

          <Card size="sm" className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Live preview</CardTitle>
                <CardDescription>Published registry component after save.</CardDescription>
              </div>
              <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
                {(["light", "dark"] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                      previewTheme === theme
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setPreviewTheme(theme)}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </CardHeader>
            <Separator />
            <div
              className={cn(
                "component-showcase flex min-h-[min(60vh,560px)] items-center justify-center overflow-hidden text-foreground",
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
                  Paste code and save once. The live preview appears here after publish.
                </p>
              )}
            </div>
          </Card>
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
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} preview background`}
          className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border border-input bg-card p-0.5"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          className="font-mono text-xs"
          placeholder={fallback}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
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
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
