export type ExtractedControl = {
  path: string;
  label: string;
  kind:
    | "slider"
    | "toggle"
    | "text"
    | "color"
    | "image"
    | "spring"
    | "easing"
    | "select"
    | "folder"
    | "unknown";
  config: unknown;
  enabled: boolean;
};

function labelFromPath(path: string) {
  return path
    .split(".")
    .pop()!
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function isHexColor(value: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

function isImageUrl(value: string) {
  return (
    /^https?:\/\//i.test(value) &&
    /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(value)
  );
}

function classifyValue(value: unknown): ExtractedControl["kind"] {
  if (Array.isArray(value) && value.length >= 3 && typeof value[0] === "number") {
    return "slider";
  }
  if (typeof value === "boolean") return "toggle";
  if (typeof value === "number") return "slider";
  if (typeof value === "string") {
    if (isHexColor(value)) return "color";
    if (isImageUrl(value) || /image|avatar|photo|src|url/i.test(value))
      return "image";
    return "text";
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.type === "spring") return "spring";
    if (obj.type === "easing") return "easing";
    if (obj.type === "select") return "select";
    if (obj.type === "color") return "color";
    if (obj.type === "text") return "text";
    return "folder";
  }
  return "unknown";
}

function walkConfig(
  config: Record<string, unknown>,
  prefix = "",
  out: ExtractedControl[] = [],
) {
  for (const [key, value] of Object.entries(config)) {
    if (key === "_collapsed") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const kind = classifyValue(value);

    if (kind === "folder" && value && typeof value === "object") {
      out.push({
        path,
        label: labelFromPath(path),
        kind: "folder",
        config: value,
        enabled: true,
      });
      walkConfig(value as Record<string, unknown>, path, out);
      continue;
    }

    out.push({
      path,
      label: labelFromPath(path),
      kind,
      config: value,
      enabled: true,
    });
  }
  return out;
}

/** Extract `export const dialConfig = { ... }` object literal from source. */
export function extractDialConfigSource(source: string): string | null {
  const start = source.search(/export\s+const\s+dialConfig\s*=\s*\{/);
  if (start === -1) return null;

  const braceStart = source.indexOf("{", start);
  if (braceStart === -1) return null;

  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;
  let escaped = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart, i + 1);
    }
  }
  return null;
}

export function parseDialConfigObject(source: string): Record<string, unknown> | null {
  const literal = extractDialConfigSource(source);
  if (!literal) return null;
  try {
    // dialConfig is authored as a JS object literal; evaluate in a sandbox-ish Function
    // eslint-disable-next-line no-new-func
    const value = new Function(`return (${literal})`)();
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

/** Heuristic extraction when dialConfig is missing. */
export function heuristicDialConfig(source: string): Record<string, unknown> {
  const config: Record<string, unknown> = {
    previewPadding: [24, 0, 96, 4],
    spring: {
      type: "spring",
      visualDuration: 0.35,
      bounce: 0.2,
    },
  };

  const stringConsts = [
    ...source.matchAll(
      /(?:const|let)\s+([A-Za-z_][\w]*)\s*=\s*["'`]([^"'`]{1,120})["'`]/g,
    ),
  ];

  for (const [, name, value] of stringConsts) {
    if (/text|title|label|subtitle|heading|name|description/i.test(name)) {
      config[name] = value;
    } else if (isHexColor(value)) {
      config[name] = value;
    } else if (isImageUrl(value) || /image|avatar|src|photo/i.test(name)) {
      config[name] = value;
    }
  }

  const urlMatches = [
    ...source.matchAll(
      /(?:src|image|url)\s*[:=]\s*["'`](https?:\/\/[^"'`]+)["'`]/gi,
    ),
  ];
  urlMatches.slice(0, 4).forEach((match, i) => {
    const key = i === 0 ? "imageUrl" : `imageUrl${i + 1}`;
    if (!config[key]) config[key] = match[1];
  });

  const durationMatch = source.match(
    /duration\s*:\s*([0-9]*\.?[0-9]+)/,
  );
  if (durationMatch) {
    const d = Number(durationMatch[1]);
    config.duration = [d, 0.05, Math.max(2, d * 3), 0.05];
  }

  return config;
}

export function extractControlsFromSource(source: string): {
  dialConfig: Record<string, unknown>;
  controls: ExtractedControl[];
  fromDialConfig: boolean;
} {
  const parsed = parseDialConfigObject(source);
  const dialConfig = parsed ?? heuristicDialConfig(source);
  return {
    dialConfig,
    controls: walkConfig(dialConfig),
    fromDialConfig: Boolean(parsed),
  };
}

export function filterDialConfig(
  config: Record<string, unknown>,
  disabled: string[],
): Record<string, unknown> {
  const disabledSet = new Set(disabled);

  function filter(
    node: Record<string, unknown>,
    prefix = "",
  ): Record<string, unknown> {
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "_collapsed") {
        next[key] = value;
        continue;
      }
      const path = prefix ? `${prefix}.${key}` : key;
      if (disabledSet.has(path)) continue;

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !("type" in (value as object))
      ) {
        const nested = filter(value as Record<string, unknown>, path);
        if (Object.keys(nested).some((k) => k !== "_collapsed")) {
          next[key] = nested;
        }
        continue;
      }
      next[key] = value;
    }
    return next;
  }

  return filter(config);
}

export function ensureDialConfigInSource(
  source: string,
  dialConfig: Record<string, unknown>,
): string {
  if (extractDialConfigSource(source)) {
    return source.replace(
      /export\s+const\s+dialConfig\s*=\s*\{[\s\S]*?\n\}(?:\s*as\s+const)?\s*;?/,
      `export const dialConfig = ${JSON.stringify(dialConfig, null, 2)} as const;`,
    );
  }

  const importLine = `import { useDialKit } from "dialkit";\n`;
  const hasImport = /from\s+["']dialkit["']/.test(source);
  let next = source;
  if (!hasImport) {
    if (/^["']use client["'];?\s*/.test(next)) {
      next = next.replace(
        /^(["']use client["'];?\s*)/,
        `$1\n${importLine}`,
      );
    } else {
      next = importLine + next;
    }
  }

  const dialBlock = `\nexport const dialConfig = ${JSON.stringify(dialConfig, null, 2)} as const;\n`;

  // Inject dialConfig before the default export / main component
  if (/export\s+default\s+function/.test(next)) {
    next = next.replace(
      /export\s+default\s+function/,
      `${dialBlock}\nexport default function`,
    );
  } else if (/export\s+default/.test(next)) {
    next = next.replace(/export\s+default/, `${dialBlock}\nexport default`);
  } else {
    next += dialBlock;
  }

  // Soft hint: if component body exists, try to insert useDialKit call once
  if (!/useDialKit\s*\(/.test(next)) {
    next = next.replace(
      /(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)/,
      `$1\n  const params = useDialKit("${guessPanelName(dialConfig)}", dialConfig);\n  void params;\n`,
    );
  }

  return next;
}

function guessPanelName(config: Record<string, unknown>) {
  const title = config.title;
  if (typeof title === "string" && title.trim()) return title.trim();
  return "Component";
}

export function isLocalImageValue(value: unknown) {
  if (typeof value !== "string") return false;
  return (
    value.startsWith("blob:") ||
    value.startsWith("data:") ||
    value.startsWith("file:") ||
    (!/^https?:\/\//i.test(value) && /\.(png|jpe?g|gif|webp|svg)$/i.test(value))
  );
}
