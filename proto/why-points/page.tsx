"use client";

import * as React from "react";
import { POINTS, WhyPointStage, type PointKey } from "./variants";
import "./picker.css";

export default function WhyPointsProtoPage() {
  const [pointKey, setPointKey] = React.useState<PointKey>("motion");
  const [index, setIndex] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [mountKey, setMountKey] = React.useState(0);
  const highlightRef = React.useRef<HTMLSpanElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const variants = POINTS[pointKey].variants;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");
    const v = Number(params.get("v") || "1") - 1;
    if (p === "blank" || p === "motion") setPointKey(p);
    const len = POINTS[p === "blank" ? "blank" : "motion"].variants.length;
    setIndex(Math.min(Math.max(v, 0), len - 1));
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
  }, [index, moveHighlight, mountKey, pointKey]);

  React.useEffect(() => {
    window.addEventListener("resize", moveHighlight);
    return () => window.removeEventListener("resize", moveHighlight);
  }, [moveHighlight]);

  const syncUrl = React.useCallback((p: PointKey, i: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("p", p);
    url.searchParams.set("v", String(i + 1));
    history.replaceState(null, "", url);
  }, []);

  const setActive = React.useCallback(
    (i: number) => {
      if (i < 0 || i >= variants.length) return;
      setIndex(i);
      setMountKey((k) => k + 1);
      syncUrl(pointKey, i);
    },
    [pointKey, syncUrl, variants.length],
  );

  const switchPoint = React.useCallback(
    (p: PointKey) => {
      setPointKey(p);
      setIndex(0);
      setMountKey((k) => k + 1);
      syncUrl(p, 0);
    },
    [syncUrl],
  );

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
      if (e.key === "m" || e.key === "M") {
        switchPoint("motion");
        return;
      }
      if (e.key === "b" || e.key === "B") {
        switchPoint("blank");
        return;
      }
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= variants.length) setActive(num - 1);
      else if (e.key === "ArrowRight")
        setActive((index + 1) % variants.length);
      else if (e.key === "ArrowLeft")
        setActive((index - 1 + variants.length) % variants.length);
      else if (e.key === "r" || e.key === "R") setMountKey((k) => k + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, setActive, switchPoint, variants.length]);

  return (
    <div className="min-h-svh bg-[#0a0a0a] p-4 pb-28 text-white sm:p-6 sm:pb-32">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-[11px] tracking-wide text-white/40 uppercase">
          Proto · Why point illustrations
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(Object.keys(POINTS) as PointKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => switchPoint(key)}
              className={
                key === pointKey
                  ? "rounded-full bg-white/15 px-3 py-1.5 text-[13px] text-white"
                  : "rounded-full bg-white/5 px-3 py-1.5 text-[13px] text-white/55 hover:text-white/85"
              }
              aria-pressed={key === pointKey}
            >
              {POINTS[key].label}
            </button>
          ))}
          <span className="ml-2 text-[12px] text-white/35">
            <kbd className="rounded bg-white/10 px-1">M</kbd> /{" "}
            <kbd className="rounded bg-white/10 px-1">B</kbd> ·{" "}
            <kbd className="rounded bg-white/10 px-1">1</kbd>–
            <kbd className="rounded bg-white/10 px-1">3</kbd>
          </span>
        </div>

        <div key={`${pointKey}-${mountKey}`}>
          <WhyPointStage pointKey={pointKey} variantIndex={index} />
        </div>
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
        {variants.map((variant, i) => (
          <button
            key={`${pointKey}-${variant.name}`}
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
      </nav>
    </div>
  );
}
