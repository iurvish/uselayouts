"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  VideoIcon,
  X,
} from "lucide-react";

import { ComponentLivePreview } from "@/components/admin/live-preview";
import { DependencyTags } from "@/components/admin/dependency-tags";
import { PreviewHint } from "@/components/open/preview-hint";
import { detectDependencies } from "@/lib/admin/detect-code";
import { generateComponentCopy } from "@/lib/admin/generate-copy";
import { extractHints } from "@/lib/open/mdx-extract";
import {
  DEFAULT_PREVIEW_BACKGROUNDS,
  NONE_PREVIEW_BACKGROUND,
  isPreviewBackgroundNone,
  parsePreviewBackgrounds,
  resolvePreviewBackground,
  serializePreviewBackgrounds,
} from "@/lib/open/preview-background";
import {
  PREVIEW_HINT_KINDS,
  PREVIEW_HINT_PRESETS,
  hintToneForBackground,
  parsePreviewHint,
  resolvePreviewHint,
  type PreviewHintKind,
} from "@/lib/open/preview-hint-config";
import { Index } from "@/registry/__index__";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  features: "",
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
  const [hintTop, setHintTop] = useState(80);
  const [showHint, setShowHint] = useState(false);
  const [hintKind, setHintKind] = useState<PreviewHintKind>("click");
  const [hintHeading, setHintHeading] = useState("");
  const [hintDescription, setHintDescription] = useState("");
  const [hintHideOnScroll, setHintHideOnScroll] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");
  const [previewKey, setPreviewKey] = useState(0);
  const [depsLocked, setDepsLocked] = useState(false);
  const [copyLocked, setCopyLocked] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [removingMedia, setRemovingMedia] = useState<"poster" | "video" | null>(null);
  const [framePickerOpen, setFramePickerOpen] = useState(false);
  const [mediaNote, setMediaNote] = useState<string | null>(null);

  const imagePreviewUrl = useObjectUrl(imageFile);
  const videoPreviewUrl = useObjectUrl(videoFile);

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
        setCopyLocked(true);
        const backgrounds = parsePreviewBackgrounds(data.controls?.previewBackground);
        setPreviewBgLight(backgrounds.light ?? DEFAULT_PREVIEW_BACKGROUNDS.light);
        setPreviewBgDark(backgrounds.dark ?? DEFAULT_PREVIEW_BACKGROUNDS.dark);
        const loadedHint =
          typeof data.controls?.hintTop === "number" ? data.controls.hintTop : 80;
        setHintTop(Math.min(200, Math.max(-200, Math.round(loadedHint))));
        const hint = parsePreviewHint(data.controls);
        setShowHint(hint.show);
        setHintKind(hint.kind);
        setHintHeading(hint.heading);
        setHintDescription(hint.description);
        setHintHideOnScroll(hint.hideOnScroll);
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
    if (mode !== "create" || copyLocked) return;
    const timer = window.setTimeout(() => {
      const generated = generateComponentCopy(form.code);
      setForm((current) => ({
        ...current,
        title: current.title.trim() ? current.title : generated.title,
        description: current.description.trim()
          ? current.description
          : generated.description,
        features: current.features.trim()
          ? current.features
          : generated.features.join("\n"),
      }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [form.code, mode, copyLocked]);

  const noPreviewBackground =
    isPreviewBackgroundNone(previewBgLight) &&
    isPreviewBackgroundNone(previewBgDark);

  const activePreviewBackground = useMemo(
    () =>
      resolvePreviewBackground(
        { light: previewBgLight, dark: previewBgDark },
        previewTheme,
      ),
    [previewBgLight, previewBgDark, previewTheme],
  );

  function applyGeneratedCopy(force = false) {
    const generated = generateComponentCopy(form.code);
    setForm((current) => ({
      ...current,
      title: force || !current.title.trim() ? generated.title : current.title,
      description:
        force || !current.description.trim()
          ? generated.description
          : current.description,
      features:
        force || !current.features.trim()
          ? generated.features.join("\n")
          : current.features,
    }));
    setCopyLocked(true);
    setMessage("Generated brief title, description, and features.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      ...(mode === "create" && form.name.trim() ? { name: form.name.trim() } : {}),
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
      hintTop,
      showHint,
      hintKind,
      hintHeading,
      hintDescription,
      hintHideOnScroll,
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
    setForm((current) => ({ ...current, name: data.name }));
    setPreviewKey((key) => key + 1);
    setDepsLocked(true);
    setCopyLocked(true);
    router.refresh();
    if (mode === "create") {
      router.push(`/admin/${data.name}`);
    } else if (initialName && data.name !== initialName) {
      router.replace(`/admin/${data.name}`);
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
    setMediaNote(null);

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
    setMediaNote(uploadNote(data));
    router.refresh();
  }

  async function handleRemoveMedia(kind: "poster" | "video") {
    const slug = initialName || form.name.trim();
    if (!slug) return;

    if (kind === "poster" && imageFile) {
      setImageFile(null);
      return;
    }
    if (kind === "video" && videoFile) {
      setVideoFile(null);
      return;
    }

    setRemovingMedia(kind);
    setError(null);
    setMessage(null);
    setMediaNote(null);

    const res = await fetch(`/api/admin/components/${slug}/media`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        kind === "poster" ? { poster: true, video: false } : { poster: false, video: true },
      ),
    });
    const data = await res.json();
    setRemovingMedia(null);

    if (!res.ok) {
      setError(data.error || "Could not remove media");
      return;
    }

    setPosterUrl(data.posterUrl ?? null);
    setVideoUrl(data.videoUrl ?? null);
    setMediaNote(kind === "poster" ? "Poster removed." : "Video removed.");
    router.refresh();
  }

  const previewName = initialName || form.name.trim() || undefined;
  const mediaSlug = mode === "edit" ? initialName : undefined;
  const Preview = previewName
    ? (Index[previewName]?.component as ComponentType<{ size?: string }> | undefined)
    : undefined;
  const previewHint = resolvePreviewHint({
    show: showHint,
    kind: hintKind,
    heading: hintHeading,
    description: hintDescription,
    hideOnScroll: hintHideOnScroll,
  });
  const hintTone = activePreviewBackground
    ? hintToneForBackground(activePreviewBackground)
    : previewTheme === "light"
      ? "light"
      : "dark";

  const showPoster = imagePreviewUrl || posterUrl;
  const showVideo = videoPreviewUrl || videoUrl;

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
                ? "Paste source — copy and dependencies auto-fill. Save once to publish the live preview."
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
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Basics</CardTitle>
                <CardDescription>Name and copy shown on browse / open.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyGeneratedCopy(true)}
              >
                <Sparkles data-icon="inline-start" />
                Generate
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => {
                      setCopyLocked(true);
                      setForm((f) => ({ ...f, title: e.target.value }));
                    }}
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
                  onChange={(e) => {
                    setCopyLocked(true);
                    setForm((f) => ({ ...f, description: e.target.value }));
                  }}
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
              <CardDescription>
                One perk per line — include a “Where to use” line when you can.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder={
                  "Motion-powered interactions\nAccessible keyboard support\nWhere to use: Landing pages and product demos"
                }
                value={form.features}
                onChange={(e) => {
                  setCopyLocked(true);
                  setForm((f) => ({ ...f, features: e.target.value }));
                }}
              />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Preview backgrounds</CardTitle>
              <CardDescription>
                Light and dark colors for the open-page canvas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">No background</span>
                <input
                  type="checkbox"
                  checked={noPreviewBackground}
                  aria-label="Use the app canvas instead of a custom preview background"
                  className="size-4 accent-foreground"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreviewBgLight(NONE_PREVIEW_BACKGROUND);
                      setPreviewBgDark(NONE_PREVIEW_BACKGROUND);
                      return;
                    }
                    setPreviewBgLight(DEFAULT_PREVIEW_BACKGROUNDS.light);
                    setPreviewBgDark(DEFAULT_PREVIEW_BACKGROUNDS.dark);
                  }}
                />
              </label>
              {noPreviewBackground ? (
                <p className="text-xs text-muted-foreground">
                  Uses the app canvas behind the preview.
                </p>
              ) : (
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
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Preview hint</CardTitle>
              <CardDescription>
                Overlay on the live preview and open page. Off by default.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Show hint</span>
                <input
                  type="checkbox"
                  checked={showHint}
                  aria-label="Show preview hint"
                  className="size-4 accent-foreground"
                  onChange={(e) => setShowHint(e.target.checked)}
                />
              </label>
              {showHint ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Hint</Label>
                    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
                      {PREVIEW_HINT_KINDS.map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                            hintKind === kind
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          onClick={() => setHintKind(kind)}
                        >
                          {kind === "custom" ? "Custom" : PREVIEW_HINT_PRESETS[kind].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hintKind === "custom" ? (
                    <div className="grid gap-3">
                      <Field label="Heading">
                        <Input
                          value={hintHeading}
                          placeholder="Click"
                          onChange={(e) => setHintHeading(e.target.value)}
                        />
                      </Field>
                      <Field label="Description">
                        <Textarea
                          rows={2}
                          value={hintDescription}
                          placeholder="Click to try it"
                          onChange={(e) => setHintDescription(e.target.value)}
                        />
                      </Field>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {PREVIEW_HINT_PRESETS[hintKind].heading}
                      {" — "}
                      {PREVIEW_HINT_PRESETS[hintKind].description}
                    </p>
                  )}
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">Hide when scrolling</span>
                    <input
                      type="checkbox"
                      checked={hintHideOnScroll}
                      aria-label="Hide hint when scrolling"
                      className="size-4 accent-foreground"
                      onChange={(e) => setHintHideOnScroll(e.target.checked)}
                    />
                  </label>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs text-muted-foreground">Hint top</Label>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {hintTop}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-200}
                      max={200}
                      step={1}
                      value={hintTop}
                      aria-label="Preview hint top offset"
                      className="h-8 w-full cursor-pointer accent-foreground"
                      onChange={(e) => setHintTop(Number(e.target.value))}
                    />
                  </div>
                </>
              ) : null}
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
                  if (mode === "create") setCopyLocked(false);
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

        <div className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:max-h-[calc(100vh-5.5rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
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
                "component-showcase flex min-h-[min(52vh,480px)] items-center justify-center overflow-hidden text-foreground",
                previewTheme === "dark" ? "dark" : "light",
                !activePreviewBackground && "bg-muted",
              )}
              style={
                {
                  ...(activePreviewBackground
                    ? { background: activePreviewBackground }
                    : {}),
                  "--preview-hint-top": `${hintTop}px`,
                } as CSSProperties
              }
            >
              {Preview ? (
                <Suspense
                  fallback={
                    <div className="flex size-24 items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  }
                >
                  {previewHint ? (
                    <PreviewHint
                      heading={previewHint.heading}
                      description={previewHint.description}
                      tone={hintTone}
                      hideOnScroll={previewHint.hideOnScroll}
                      className="w-full self-stretch"
                    >
                      <div
                        key={previewKey}
                        className="flex h-full w-full items-center justify-center p-4"
                      >
                        <Preview size="lg" />
                      </div>
                    </PreviewHint>
                  ) : (
                    <div
                      key={previewKey}
                      className="flex h-full w-full items-center justify-center p-4"
                    >
                      <Preview size="lg" />
                    </div>
                  )}
                </Suspense>
              ) : (
                <p className="max-w-sm px-6 text-center text-sm text-muted-foreground">
                  Paste code and save once. The live preview appears here after publish.
                </p>
              )}
            </div>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Browse media</CardTitle>
              <CardDescription>
                Poster + video for browse cards. Drop files onto a slot, or click
                to choose. Grab a still from the video if you already have one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!mediaSlug ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  Save the component first, then add browse media here.
                </p>
              ) : (
                <>
                  <div
                    className="grid gap-3 sm:grid-cols-2"
                    onDragOver={(e) => {
                      if (![...e.dataTransfer.types].includes("Files")) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                    }}
                    onDrop={(e) => {
                      const files = e.dataTransfer.files;
                      if (!files.length) return;
                      const image = firstMatchingFile(files, "image/*");
                      const video = firstMatchingFile(files, "video/*");
                      if (!image && !video) return;
                      e.preventDefault();
                      if (image) {
                        setImageFile(image);
                        setMediaNote(null);
                      }
                      if (video) {
                        setVideoFile(video);
                        setMediaNote(null);
                      }
                    }}
                  >
                    <MediaSlot
                      label="Image"
                      icon={<ImageIcon className="size-5" />}
                      accept="image/*"
                      hasMedia={Boolean(showPoster)}
                      removing={removingMedia === "poster"}
                      onPick={(file) => {
                        setImageFile(file);
                        setMediaNote(null);
                      }}
                      onPickFromVideo={
                        showVideo ? () => setFramePickerOpen(true) : undefined
                      }
                      onRemove={() => handleRemoveMedia("poster")}
                    >
                      {imagePreviewUrl || posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin local/CDN preview
                        <img
                          src={imagePreviewUrl || posterUrl || ""}
                          alt=""
                          className="absolute inset-0 size-full object-cover"
                        />
                      ) : null}
                    </MediaSlot>

                    <MediaSlot
                      label="Video"
                      icon={<VideoIcon className="size-5" />}
                      accept="video/*"
                      hasMedia={Boolean(showVideo)}
                      removing={removingMedia === "video"}
                      onPick={(file) => {
                        setVideoFile(file);
                        setMediaNote(null);
                      }}
                      onRemove={() => handleRemoveMedia("video")}
                    >
                      {videoPreviewUrl || videoUrl ? (
                        <video
                          src={videoPreviewUrl || videoUrl || ""}
                          muted
                          playsInline
                          loop
                          autoPlay
                          className="absolute inset-0 size-full object-cover"
                        />
                      ) : null}
                    </MediaSlot>
                  </div>

                  {(imageFile || videoFile) && (
                    <p className="text-center text-xs text-muted-foreground">
                      {imageFile ? imageFile.name : null}
                      {imageFile && videoFile ? " · " : null}
                      {videoFile ? videoFile.name : null}
                    </p>
                  )}

                  <FramePickerDialog
                    open={framePickerOpen}
                    src={videoPreviewUrl || videoUrl}
                    onOpenChange={setFramePickerOpen}
                    onPick={(file) => {
                      setImageFile(file);
                      setFramePickerOpen(false);
                    }}
                  />

                  <div className="flex flex-col items-center gap-2 pt-1">
                    <Button
                      type="button"
                      disabled={uploadingMedia || (!imageFile && !videoFile)}
                      onClick={handleMediaUpload}
                    >
                      {uploadingMedia ? (
                        <>
                          <Loader2 data-icon="inline-start" className="animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <Upload data-icon="inline-start" />
                          Upload to R2
                        </>
                      )}
                    </Button>
                    {mediaNote ? (
                      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-center text-sm text-emerald-700">
                        {mediaNote}
                      </p>
                    ) : error ? (
                      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-center text-sm text-destructive">
                        {error}
                      </p>
                    ) : null}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function uploadNote(data: {
  posterBytes?: number;
  videoSourceBytes?: number | null;
  videoDeliveryBytes?: number | null;
}) {
  const parts = ["Uploaded to R2."];
  if (data.videoSourceBytes && data.videoDeliveryBytes) {
    parts.push(
      `Video ${formatBytes(data.videoSourceBytes)} → ${formatBytes(data.videoDeliveryBytes)}.`,
    );
  }
  if (data.posterBytes) {
    parts.push(`Poster ${formatBytes(data.posterBytes)}.`);
  }
  return parts.join(" ");
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (prev.current) URL.revokeObjectURL(prev.current);
    if (!file) {
      prev.current = null;
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    prev.current = next;
    setUrl(next);
    return () => {
      URL.revokeObjectURL(next);
    };
  }, [file]);

  return url;
}

function formatTimecode(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function videoDuration(video: HTMLVideoElement) {
  if (Number.isFinite(video.duration) && video.duration > 0) return video.duration;
  if (video.seekable.length > 0) {
    const end = video.seekable.end(video.seekable.length - 1);
    if (Number.isFinite(end) && end > 0) return end;
  }
  return 0;
}

function waitForSeek(video: HTMLVideoElement) {
  if (!video.seeking) return Promise.resolve();
  return new Promise<void>((resolve) => {
    video.addEventListener("seeked", () => resolve(), { once: true });
  });
}

function FramePickerDialog({
  open,
  src,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  src: string | null;
  onOpenChange: (open: boolean) => void;
  onPick: (file: File) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const remote = Boolean(src && !src.startsWith("blob:"));

  useEffect(() => {
    if (!open) {
      setDuration(0);
      setTime(0);
      setReady(false);
      setCapturing(false);
      setCaptureError(null);
    }
  }, [open, src]);

  function seekTo(next: number) {
    setTime(next);
    const video = videoRef.current;
    if (video) video.currentTime = next;
  }

  async function useFrame() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    setCapturing(true);
    setCaptureError(null);
    await waitForSeek(video);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCapturing(false);
      setCaptureError("Could not capture this frame.");
      return;
    }
    ctx.drawImage(video, 0, 0);
    let blob: Blob | null = null;
    try {
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92),
      );
    } catch {
      blob = null;
    }
    setCapturing(false);
    if (!blob) {
      setCaptureError(
        remote
          ? "This hosted video can’t be captured. Choose the video file again, then pick a frame."
          : "Could not capture this frame.",
      );
      return;
    }
    onPick(new File([blob], "poster.jpg", { type: "image/jpeg" }));
  }

  const span = Number.isFinite(duration) && duration > 0 ? duration : 0;

  function syncDuration(video: HTMLVideoElement) {
    setDuration(videoDuration(video));
    setReady(video.videoWidth > 0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="light bg-background text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pick a frame</DialogTitle>
          <DialogDescription>
            Scrub the video and use the current frame as the poster.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg bg-muted">
            {open && src ? (
              <video
                ref={videoRef}
                src={src}
                muted
                playsInline
                preload="auto"
                crossOrigin={remote ? "anonymous" : undefined}
                className="aspect-[4/3] w-full object-contain"
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  const next = videoDuration(video);
                  setDuration(next);
                  setReady(video.videoWidth > 0);
                  if (next > 0) {
                    video.currentTime = Math.min(0.04, next);
                    setTime(video.currentTime);
                  }
                }}
                onDurationChange={(e) => syncDuration(e.currentTarget)}
              />
            ) : null}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="frame-picker-time" className="text-xs text-muted-foreground">
                Frame
              </Label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {formatTimecode(time)}
                {span > 0 ? ` / ${formatTimecode(span)}` : null}
              </span>
            </div>
            <input
              id="frame-picker-time"
              type="range"
              min={0}
              max={span}
              step={0.04}
              value={Math.min(time, span)}
              disabled={!ready || span <= 0}
              aria-label="Video frame"
              className="h-8 w-full cursor-pointer accent-foreground disabled:cursor-not-allowed"
              onChange={(e) => seekTo(Number(e.target.value))}
            />
          </div>
          {captureError ? (
            <p className="text-xs text-destructive">{captureError}</p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!ready || capturing}
            onClick={useFrame}
          >
            {capturing ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Capturing…
              </>
            ) : (
              "Use this frame"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function fileMatchesAccept(file: File, accept: string) {
  if (accept === "image/*") {
    return (
      file.type.startsWith("image/") ||
      /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)
    );
  }
  if (accept === "video/*") {
    return (
      file.type.startsWith("video/") ||
      /\.(m4v|mkv|mov|mp4|webm)$/i.test(file.name)
    );
  }
  return true;
}

function firstMatchingFile(files: FileList | File[], accept: string) {
  return Array.from(files).find((file) => fileMatchesAccept(file, accept)) ?? null;
}

function MediaSlot({
  label,
  icon,
  accept,
  hasMedia,
  removing,
  onPick,
  onPickFromVideo,
  onRemove,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  hasMedia: boolean;
  removing: boolean;
  onPick: (file: File) => void;
  onPickFromVideo?: () => void;
  onRemove: () => void;
  children?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const dragging = dragDepth > 0;

  function takeDroppedFile(data: DataTransfer) {
    const file = firstMatchingFile(data.files, accept);
    if (file) onPick(file);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-muted/20 transition-[border-color,background-color,box-shadow] duration-150 ease-out",
        dragging
          ? "border-foreground/40 bg-muted/50 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
          : "border-border",
      )}
      onDragEnter={(e) => {
        if (![...e.dataTransfer.types].includes("Files")) return;
        e.preventDefault();
        e.stopPropagation();
        setDragDepth((n) => n + 1);
      }}
      onDragOver={(e) => {
        if (![...e.dataTransfer.types].includes("Files")) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragDepth((n) => Math.max(0, n - 1));
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragDepth(0);
        takeDroppedFile(e.dataTransfer);
      }}
    >
      <div className="relative aspect-[4/3]">
        {hasMedia ? (
          children
        ) : (
          <button
            type="button"
            className={cn(
              "flex size-full cursor-pointer flex-col items-center justify-center gap-2 px-3 text-muted-foreground transition-[color,background-color] duration-150 ease-out hover:bg-muted/40 hover:text-foreground",
              onPickFromVideo && "pb-9",
            )}
            onClick={() => inputRef.current?.click()}
          >
            {icon}
            <span className="text-xs font-medium">{label}</span>
            <span className="text-[11px] text-muted-foreground">
              Drop or click to choose
            </span>
          </button>
        )}

        {dragging ? (
          <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-1 bg-background/80 text-foreground">
            {icon}
            <span className="text-xs font-medium">Drop {label.toLowerCase()}</span>
          </div>
        ) : null}

        {!hasMedia && onPickFromVideo ? (
          <button
            type="button"
            className="absolute inset-x-0 bottom-0 z-10 flex h-10 cursor-pointer items-center justify-center border-t border-border bg-background/90 text-xs font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted"
            onClick={onPickFromVideo}
          >
            Pick from video
          </button>
        ) : null}

        {hasMedia ? (
          <>
            <button
              type="button"
              className="absolute inset-0 z-0 cursor-pointer"
              aria-label={`Replace ${label.toLowerCase()}`}
              onClick={() => inputRef.current?.click()}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/50 to-transparent px-2 pb-2 pt-8">
              <div className="flex items-end justify-between gap-2">
                <p className="text-[11px] font-medium text-white">{label}</p>
                {onPickFromVideo ? (
                  <button
                    type="button"
                    className="pointer-events-auto relative z-20 cursor-pointer text-[11px] font-medium text-white underline-offset-2 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPickFromVideo();
                    }}
                  >
                    From video
                  </button>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              aria-label={`Remove ${label.toLowerCase()}`}
              disabled={removing}
              className="absolute top-2 right-2 z-20 inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border bg-background/95 text-foreground shadow-sm transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-60"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <X className="size-3.5" />
              )}
            </button>
          </>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </div>
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
