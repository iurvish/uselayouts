export type PreviewBackgrounds = {
  light?: string;
  dark?: string;
};

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const DEFAULT_PREVIEW_BACKGROUNDS = {
  light: "#ffffff",
  dark: "#141414",
} as const;

export function isCssColor(value: string) {
  const next = value.trim();
  if (!next) return false;
  if (HEX.test(next)) return true;
  if (next.startsWith("rgb(") || next.startsWith("rgba(") || next.startsWith("hsl(") || next.startsWith("oklch(")) {
    return true;
  }
  return false;
}

export function parsePreviewBackgrounds(raw: unknown): PreviewBackgrounds {
  if (!raw) return {};
  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return {};
    // Legacy single color applied to both themes.
    return { light: value, dark: value };
  }
  if (typeof raw !== "object") return {};
  const value = raw as Record<string, unknown>;
  const light = typeof value.light === "string" ? value.light.trim() : "";
  const dark = typeof value.dark === "string" ? value.dark.trim() : "";
  return {
    light: light || undefined,
    dark: dark || undefined,
  };
}

export function resolvePreviewBackground(
  backgrounds: PreviewBackgrounds | undefined,
  theme: "light" | "dark",
) {
  const value = backgrounds?.[theme]?.trim();
  if (value) return value;
  return DEFAULT_PREVIEW_BACKGROUNDS[theme];
}

export function serializePreviewBackgrounds(input: {
  light?: string;
  dark?: string;
}): PreviewBackgrounds | undefined {
  const light = input.light?.trim() || undefined;
  const dark = input.dark?.trim() || undefined;
  if (!light && !dark) return undefined;
  return { light, dark };
}
