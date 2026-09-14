export const PREVIEW_HINT_KINDS = [
  "click",
  "drag",
  "scroll",
  "hover",
  "swipe",
  "custom",
] as const;

export type PreviewHintKind = (typeof PREVIEW_HINT_KINDS)[number];

export const PREVIEW_HINT_PRESETS: Record<
  Exclude<PreviewHintKind, "custom">,
  { label: string; heading: string; description: string }
> = {
  click: {
    label: "Click",
    heading: "Click to open",
    description: "Click the folder to read the letter",
  },
  drag: {
    label: "Drag",
    heading: "Drag to explore",
    description: "Grab and drag to move through the stack",
  },
  scroll: {
    label: "Scroll",
    heading: "Scroll to reveal",
    description: "Scroll to move through the text",
  },
  hover: {
    label: "Hover",
    heading: "Hover to peek",
    description: "Hover to preview the interaction",
  },
  swipe: {
    label: "Swipe",
    heading: "Swipe to browse",
    description: "Swipe or click to cycle through the stack",
  },
};

export type PreviewHintConfig = {
  show: boolean;
  kind: PreviewHintKind;
  heading: string;
  description: string;
};

export type ResolvedPreviewHint = {
  heading: string;
  description?: string;
};

export function parsePreviewHintKind(value: unknown): PreviewHintKind {
  if (typeof value === "string" && (PREVIEW_HINT_KINDS as readonly string[]).includes(value)) {
    return value as PreviewHintKind;
  }
  return "click";
}

export function parsePreviewHint(raw: unknown): PreviewHintConfig {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    show: rec.showHint === true,
    kind: parsePreviewHintKind(rec.hintKind),
    heading: typeof rec.hintHeading === "string" ? rec.hintHeading : "",
    description: typeof rec.hintDescription === "string" ? rec.hintDescription : "",
  };
}

export function resolvePreviewHint(config: PreviewHintConfig): ResolvedPreviewHint | null {
  if (!config.show) return null;
  if (config.kind === "custom") {
    const heading = config.heading.trim();
    if (!heading) return null;
    const description = config.description.trim();
    return description ? { heading, description } : { heading };
  }
  const preset = PREVIEW_HINT_PRESETS[config.kind];
  return { heading: preset.heading, description: preset.description };
}

export function serializePreviewHint(config: PreviewHintConfig) {
  return {
    showHint: config.show,
    hintKind: config.kind,
    hintHeading: config.heading,
    hintDescription: config.description,
  };
}

/** PreviewHint `tone`: light = dark text on a light canvas. */
export function hintToneForBackground(css: string | undefined): "dark" | "light" {
  if (!css) return "dark";
  const t = css.trim().toLowerCase();

  const hex = t.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? "light" : "dark";
  }

  const hsl = t.match(/hsla?\(\s*[\d.]+[^\d]+[\d.]+%[^\d]+([\d.]+)%/);
  if (hsl) return Number(hsl[1]) > 55 ? "light" : "dark";

  const oklch = t.match(/oklch\(\s*([\d.]+)/);
  if (oklch) return Number(oklch[1]) > 0.55 ? "light" : "dark";

  return "dark";
}
