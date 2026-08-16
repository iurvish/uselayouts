export const HINT_KINDS = ["tap", "scroll", "drag"] as const;
export const SCROLL_DIRECTIONS = ["up", "down", "left", "right"] as const;

export type HintKind = (typeof HINT_KINDS)[number];
export type ScrollDirection = (typeof SCROLL_DIRECTIONS)[number];

export type InteractionHint = {
  id: string;
  kind: HintKind;
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  direction?: ScrollDirection;
};

export type InteractionHintConfig = {
  duration: number;
  scale: number;
  items: InteractionHint[];
};

export const DEFAULT_HINT_CONFIG: InteractionHintConfig = {
  duration: 3,
  scale: 70,
  items: [],
};

export function clampHintPercent(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}

export function clampDuration(value: number) {
  if (!Number.isFinite(value)) return 3;
  return Math.min(12, Math.max(0.5, Math.round(value * 10) / 10));
}

export function clampScale(value: number) {
  if (!Number.isFinite(value)) return 70;
  return Math.min(140, Math.max(40, Math.round(value)));
}

export function createHint(kind: HintKind = "tap"): InteractionHint {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `hint-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  if (kind === "drag") {
    return { id, kind, x: 32, y: 42, x2: 68, y2: 42 };
  }

  return {
    id,
    kind,
    x: 50,
    y: 48,
    direction: kind === "scroll" ? "down" : undefined,
  };
}

export function parseHintConfig(raw: unknown): InteractionHintConfig {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_HINT_CONFIG };
  const value = raw as Partial<InteractionHintConfig>;
  const items = Array.isArray(value.items)
    ? value.items
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const next = item as Partial<InteractionHint>;
          const kind = HINT_KINDS.includes(next.kind as HintKind) ? (next.kind as HintKind) : "tap";
          const parsed: InteractionHint = {
            id: typeof next.id === "string" && next.id ? next.id : createHint(kind).id,
            kind,
            x: clampHintPercent(Number(next.x)),
            y: clampHintPercent(Number(next.y)),
          };
          if (kind === "drag") {
            parsed.x2 = clampHintPercent(Number(next.x2 ?? parsed.x + 20));
            parsed.y2 = clampHintPercent(Number(next.y2 ?? parsed.y));
          }
          if (kind === "scroll") {
            parsed.direction = SCROLL_DIRECTIONS.includes(next.direction as ScrollDirection)
              ? (next.direction as ScrollDirection)
              : "down";
          }
          return parsed;
        })
        .filter((item): item is InteractionHint => Boolean(item))
    : [];

  return {
    duration: clampDuration(Number(value.duration) || 3),
    scale: clampScale(Number(value.scale) || 70),
    items,
  };
}
