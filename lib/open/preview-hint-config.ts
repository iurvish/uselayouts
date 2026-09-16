export const PREVIEW_HINT_KINDS = [
  "click",
  "drag",
  "scroll",
  "hover",
  "swipe",
  "scale",
  "custom",
] as const;

export type PreviewHintKind = (typeof PREVIEW_HINT_KINDS)[number];

export const PREVIEW_HINT_PRESETS: Record<
  Exclude<PreviewHintKind, "custom">,
  { label: string; heading: string; description: string }
> = {
  click: {
    label: "Click",
    heading: "Click",
    description: "Click to try it",
  },
  drag: {
    label: "Drag",
    heading: "Drag",
    description: "Drag to move it",
  },
  scroll: {
    label: "Scroll",
    heading: "Scroll",
    description: "Scroll to see it change",
  },
  hover: {
    label: "Hover",
    heading: "Hover",
    description: "Hover to see it change",
  },
  swipe: {
    label: "Swipe",
    heading: "Swipe",
    description: "Swipe to go to the next one",
  },
  scale: {
    label: "Scale",
    heading: "Scale",
    description: "Pinch or scroll to zoom",
  },
};

export type PreviewHintConfig = {
  show: boolean;
  kind: PreviewHintKind;
  heading: string;
  description: string;
  hideOnScroll: boolean;
};

export type ResolvedPreviewHint = {
  heading: string;
  description?: string;
  hideOnScroll: boolean;
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
    hideOnScroll: rec.hintHideOnScroll === true,
  };
}

export function resolvePreviewHint(config: PreviewHintConfig): ResolvedPreviewHint | null {
  if (!config.show) return null;
  if (config.kind === "custom") {
    const heading = config.heading.trim();
    if (!heading) return null;
    const description = config.description.trim();
    return {
      heading,
      ...(description ? { description } : {}),
      hideOnScroll: config.hideOnScroll,
    };
  }
  const preset = PREVIEW_HINT_PRESETS[config.kind];
  return {
    heading: preset.heading,
    description: preset.description,
    hideOnScroll: config.hideOnScroll,
  };
}

export function serializePreviewHint(config: PreviewHintConfig) {
  return {
    showHint: config.show,
    hintKind: config.kind,
    hintHeading: config.heading,
    hintDescription: config.description,
    hintHideOnScroll: config.hideOnScroll,
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
