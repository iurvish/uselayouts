"use client";

import * as React from "react";
import { Clock3, MousePointer2, Plus, Trash2 } from "lucide-react";

import { HintOverlayFrame } from "@/components/open/hint-overlay-frame";
import { cn } from "@/lib/utils";
import {
  type HintKind,
  type InteractionHint,
  type InteractionHintConfig,
  SCROLL_DIRECTIONS,
  clampDuration,
  clampHintPercent,
  clampScale,
  createHint,
} from "@/lib/open/hints";

const KINDS: { value: HintKind; label: string }[] = [
  { value: "tap", label: "Tap" },
  { value: "scroll", label: "Scroll" },
  { value: "drag", label: "Drag" },
];

export function HintEditor({
  value,
  onChange,
  children,
}: {
  value: InteractionHintConfig;
  onChange: (next: InteractionHintConfig) => void;
  children?: React.ReactNode;
}) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(value.items[0]?.id ?? null);
  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);
  const [mapBox, setMapBox] = React.useState({ width: 10, height: 7 });
  const selected = value.items.find((item) => item.id === selectedId) ?? value.items[0] ?? null;

  function patchConfig(partial: Partial<InteractionHintConfig>) {
    onChange({ ...value, ...partial });
  }

  function patchItem(id: string, patch: Partial<InteractionHint>) {
    onChange({
      ...value,
      items: value.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function pointFromEvent(event: { clientX: number; clientY: number }) {
    const box = boxRef.current;
    if (!box) return { x: 50, y: 50 };
    const rect = box.getBoundingClientRect();
    return {
      x: clampHintPercent(((event.clientX - rect.left) / rect.width) * 100),
      y: clampHintPercent(((event.clientY - rect.top) / rect.height) * 100),
    };
  }

  function addHint(kind: HintKind) {
    const next = createHint(kind);
    onChange({ ...value, items: [...value.items, next] });
    setSelectedId(next.id);
  }

  function removeHint(id: string) {
    const items = value.items.filter((item) => item.id !== id);
    onChange({ ...value, items });
    setSelectedId(items[0]?.id ?? null);
  }

  function moveHandle(
    event: React.PointerEvent,
    id: string,
    handle: "start" | "end",
  ) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

    const onMove = (move: PointerEvent) => {
      const point = pointFromEvent(move);
      if (handle === "end") patchItem(id, { x2: point.x, y2: point.y });
      else patchItem(id, { x: point.x, y: point.y });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <SliderRow
        icon={<MousePointer2 className="size-4" strokeWidth={1.75} />}
        label="Scale"
        min={40}
        max={140}
        step={1}
        value={value.scale}
        suffix=""
        onChange={(scale) => patchConfig({ scale: clampScale(scale) })}
      />
      <SliderRow
        icon={<Clock3 className="size-4" strokeWidth={1.75} />}
        label="Time"
        min={0.5}
        max={12}
        step={0.1}
        value={value.duration}
        suffix="s"
        onChange={(duration) => patchConfig({ duration: clampDuration(duration) })}
      />

      {children ? (
        <HintOverlayFrame
          className="overflow-hidden rounded-[14px] border bg-muted/20"
          onTargetRect={setMapBox}
          overlay={
            value.items.length > 0
              ? value.items.map((item) => (
                  <HintHandles
                    key={`preview-${item.id}`}
                    item={item}
                    selected={item.id === selected?.id}
                    scale={value.scale}
                  />
                ))
              : null
          }
        >
          {children}
        </HintOverlayFrame>
      ) : null}

      <div
        ref={boxRef}
        className="relative cursor-crosshair overflow-hidden rounded-[14px] bg-[#2a2a2a] select-none"
        style={{
          aspectRatio: `${Math.max(mapBox.width, 1)} / ${Math.max(mapBox.height, 1)}`,
          backgroundImage: "radial-gradient(circle, rgba(210,210,210,0.42) 1.15px, transparent 1.35px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "14px 14px",
        }}
        onPointerMove={(event) => setHover(pointFromEvent(event))}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("[data-hint-handle]")) return;
          const point = pointFromEvent(event);
          if (selected) {
            if (selected.kind === "drag") {
              const deltaX = (selected.x2 ?? selected.x) - selected.x;
              const deltaY = (selected.y2 ?? selected.y) - selected.y;
              patchItem(selected.id, {
                x: point.x,
                y: point.y,
                x2: clampHintPercent(point.x + deltaX),
                y2: clampHintPercent(point.y + deltaY),
              });
            } else {
              patchItem(selected.id, { x: point.x, y: point.y });
            }
            return;
          }
          const next = { ...createHint("tap"), ...point };
          onChange({ ...value, items: [...value.items, next] });
          setSelectedId(next.id);
        }}
      >
        {hover ? (
          <>
            <span
              className="pointer-events-none absolute inset-y-0 w-px bg-white/20"
              style={{ left: `${hover.x}%` }}
            />
            <span
              className="pointer-events-none absolute inset-x-0 h-px bg-white/20"
              style={{ top: `${hover.y}%` }}
            />
          </>
        ) : null}

        {value.items.map((item) => (
          <HintHandles
            key={item.id}
            item={item}
            selected={item.id === selected?.id}
            scale={value.scale}
            onSelect={() => setSelectedId(item.id)}
            onMoveStart={(event) => moveHandle(event, item.id, "start")}
            onMoveEnd={(event) => moveHandle(event, item.id, "end")}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {KINDS.map((kind) => (
          <button
            key={kind.value}
            type="button"
            className={cn(
              "h-8 rounded-lg border px-2.5 text-xs font-medium transition-[background-color,color,border-color] duration-150",
              selected?.kind === kind.value
                ? "border-white/20 bg-white/10 text-foreground"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
            onClick={() => {
              if (selected) {
                patchItem(selected.id, {
                  kind: kind.value,
                  direction: kind.value === "scroll" ? selected.direction ?? "down" : undefined,
                  x2: kind.value === "drag" ? selected.x2 ?? Math.min(100, selected.x + 22) : undefined,
                  y2: kind.value === "drag" ? selected.y2 ?? selected.y : undefined,
                });
              } else {
                addHint(kind.value);
              }
            }}
          >
            {kind.label}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => addHint(selected?.kind ?? "tap")}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
          Add
        </button>
      </div>

      {selected?.kind === "scroll" ? (
        <div className="flex gap-1">
          {SCROLL_DIRECTIONS.map((direction) => (
            <button
              key={direction}
              type="button"
              className={cn(
                "h-8 flex-1 rounded-lg border text-xs capitalize",
                selected.direction === direction
                  ? "border-white/20 bg-white/10 text-foreground"
                  : "border-white/10 text-muted-foreground",
              )}
              onClick={() => patchItem(selected.id, { direction })}
            >
              {direction}
            </button>
          ))}
        </div>
      ) : null}

      {value.items.length > 0 ? (
        <ul className="space-y-1">
          {value.items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-1">
              <button
                type="button"
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs",
                  item.id === selected?.id ? "bg-white/8 text-foreground" : "text-muted-foreground",
                )}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="tabular-nums text-muted-foreground">{index + 1}</span>
                <span className="capitalize">{item.kind}</span>
                <span className="ml-auto font-mono tabular-nums text-muted-foreground">
                  {Math.round(item.x)}/{Math.round(item.y)}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Remove hint ${index + 1}`}
                className="rounded p-1 text-muted-foreground hover:text-destructive"
                onClick={() => removeHint(item.id)}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Hover the dotted canvas and click to place a point. The live preview above only shows where it lands.
        </p>
      )}
    </div>
  );
}

function SliderRow({
  icon,
  label,
  min,
  max,
  step,
  value,
  suffix,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-[72px] shrink-0 items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {label}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        aria-label={label}
        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/12 accent-[#d4d4d4]"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="flex h-8 w-[72px] items-center overflow-hidden rounded-lg border border-white/12 bg-[#1a1a1a]">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={`${label} value`}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-xs tabular-nums outline-none"
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <div className="flex h-full w-4 flex-col border-l border-white/10">
          <button
            type="button"
            aria-label={`Increase ${label}`}
            className="flex flex-1 items-center justify-center text-[8px] text-muted-foreground hover:text-foreground"
            onClick={() => onChange(value + step)}
          >
            ▴
          </button>
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            className="flex flex-1 items-center justify-center text-[8px] text-muted-foreground hover:text-foreground"
            onClick={() => onChange(value - step)}
          >
            ▾
          </button>
        </div>
        {suffix ? <span className="pr-1.5 text-[10px] text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

function HintHandles({
  item,
  selected,
  scale,
  onSelect,
  onMoveStart,
  onMoveEnd,
}: {
  item: InteractionHint;
  selected: boolean;
  scale: number;
  onSelect?: () => void;
  onMoveStart?: (event: React.PointerEvent) => void;
  onMoveEnd?: (event: React.PointerEvent) => void;
}) {
  const size = 10 * (scale / 70);

  return (
    <>
      {item.kind === "drag" && item.x2 != null && item.y2 != null ? (
        <svg className="pointer-events-none absolute inset-0 z-10 size-full" aria-hidden>
          <line
            x1={`${item.x}%`}
            y1={`${item.y}%`}
            x2={`${item.x2}%`}
            y2={`${item.y2}%`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
        </svg>
      ) : null}
      <Handle
        x={item.x}
        y={item.y}
        size={size}
        selected={selected}
        label={`${item.kind} hint`}
        onSelect={onSelect}
        onMove={onMoveStart}
      />
      {item.kind === "drag" && item.x2 != null && item.y2 != null ? (
        <Handle
          x={item.x2}
          y={item.y2}
          size={size}
          selected={selected}
          label="Drag end"
          onSelect={onSelect}
          onMove={onMoveEnd}
        />
      ) : null}
    </>
  );
}

function Handle({
  x,
  y,
  size,
  selected,
  label,
  onSelect,
  onMove,
}: {
  x: number;
  y: number;
  size: number;
  selected: boolean;
  label: string;
  onSelect?: () => void;
  onMove?: (event: React.PointerEvent) => void;
}) {
  return (
    <button
      type="button"
      data-hint-handle=""
      tabIndex={onMove ? 0 : -1}
      aria-hidden={!onMove}
      aria-label={label}
      className={cn(
        "absolute z-20 p-0 touch-none rounded-full border-0 bg-white before:absolute before:inset-[-10px] before:content-['']",
        selected ? "shadow-[0_0_0_5px_rgba(255,255,255,0.16)]" : "opacity-80",
        !onMove && "pointer-events-none",
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
      onPointerDown={(event) => {
        if (!onMove) return;
        onSelect?.();
        onMove(event);
      }}
    />
  );
}
