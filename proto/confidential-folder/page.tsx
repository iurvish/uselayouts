"use client";

import * as React from "react";
import { FieldFolder } from "./field";
import { OrbitFolder } from "./orbit";
import { PlateFolder } from "./plate";

const VARIANTS = [
  { name: "Orbit", render: OrbitFolder },
  { name: "Field", render: FieldFolder },
  { name: "Plate", render: PlateFolder },
] as const;

export default function ConfidentialFolderProtoPage() {
  const [index, setIndex] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [mountKey, setMountKey] = React.useState(0);
  const highlightRef = React.useRef<HTMLSpanElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => {
    const fromUrl =
      Number(new URLSearchParams(window.location.search).get("v") || "1") - 1;
    setIndex(Math.min(Math.max(fromUrl, 0), VARIANTS.length - 1));
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
  }, []);

  const moveHighlight = React.useCallback(() => {
    const el = itemRefs.current[index];
    const highlight = highlightRef.current;
    if (!el || !highlight) return;
    highlight.style.width = `${el.offsetWidth}px`;
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [index]);

  React.useLayoutEffect(() => {
    moveHighlight();
  }, [index, moveHighlight, mountKey]);

  React.useEffect(() => {
    window.addEventListener("resize", moveHighlight);
    return () => window.removeEventListener("resize", moveHighlight);
  }, [moveHighlight]);

  const setActive = React.useCallback((i: number) => {
    if (i < 0 || i >= VARIANTS.length) return;
    setIndex(i);
    setMountKey((k) => k + 1);
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(i + 1));
    history.replaceState(null, "", url);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (
        /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) ||
        t.isContentEditable
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= VARIANTS.length) setActive(num - 1);
      else if (e.key === "ArrowRight")
        setActive((index + 1) % VARIANTS.length);
      else if (e.key === "ArrowLeft")
        setActive((index - 1 + VARIANTS.length) % VARIANTS.length);
      else if (e.key === "r" || e.key === "R") setMountKey((k) => k + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, setActive]);

  const Active = VARIANTS[index]!.render;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[oklch(0.18_0.012_260)] px-6 pb-28 pt-16 font-synthesis-none antialiased">
      <p className="mb-10 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.16em] text-white/35 uppercase">
        Click the folder · cover and letter
      </p>
      <div key={mountKey}>
        <Active />
      </div>

      <nav
        className="proto-picker"
        aria-label="Prototype variants"
        data-ready={ready ? "" : undefined}
      >
        <span
          ref={highlightRef}
          className="proto-picker-highlight"
          aria-hidden="true"
        />
        {VARIANTS.map((variant, i) => (
          <button
            key={variant.name}
            type="button"
            ref={(node) => {
              itemRefs.current[i] = node;
            }}
            className="proto-picker-item"
            data-active={i === index ? "" : undefined}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setActive(i)}
          >
            {variant.name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          type="button"
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
          onClick={() => setMountKey((k) => k + 1)}
        >
          ↻
        </button>
      </nav>
    </div>
  );
}
