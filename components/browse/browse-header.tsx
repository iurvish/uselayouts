"use client";

/* eslint-disable @next/next/no-img-element -- static SVG marks, no optimisation needed. */

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { MediaMode } from "./glass-card";
import { MediaToggle } from "./browse-toolbar";
import { SearchIcon } from "./icons";

export function BrowseHeader({
  query,
  onQueryChange,
  variant = "float",
  mediaMode,
  onMediaModeChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  variant?: "float" | "sticky";
  mediaMode: MediaMode;
  onMediaModeChange: (value: MediaMode) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "flex w-full shrink-0 items-center justify-between",
        variant === "sticky"
          ? "sticky top-0 z-30 border-b border-white/[0.08] bg-[#141414]/80 px-[22px] py-[10px] backdrop-blur-md"
          : "relative rounded-[14px] border border-white/[0.08] bg-[#242424] px-[12px] py-[6px] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]",
      )}
    >
      <Link
        href="/"
        className="flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
      >
        <img
          src="/brand/logo-wordmark.svg"
          alt="useLayouts"
          width={185}
          height={48}
          className="h-[48px] w-[185px]"
          draggable={false}
        />
      </Link>

      <div className="flex items-center gap-[10px]">
        <div className="flex w-[180px] items-center justify-between rounded-[12px] border border-white/[0.12] bg-[#030202] px-[12px] py-[8px] transition-[border-color] duration-150 ease-out focus-within:border-white/25 sm:w-[243px]">
          <div className="flex min-w-0 flex-1 items-center gap-[8px]">
            <SearchIcon className="size-[16px] shrink-0 text-[#8f8f8f]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onQueryChange("");
                  event.currentTarget.blur();
                }
              }}
              type="search"
              placeholder="Search"
              aria-label="Search components"
              className="min-w-0 flex-1 bg-transparent text-[14px] tracking-[-0.42px] text-white outline-none placeholder:text-[#8f8f8f] [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          {focused || query ? null : (
            <kbd className="relative flex shrink-0 items-center justify-center rounded-[6px] border border-white/[0.08] bg-[#212121] px-[12px] py-[2px] font-sans text-[12px] tracking-[-0.36px] text-[#bbb]">
              /
            </kbd>
          )}
        </div>

        <MediaToggle value={mediaMode} onChange={onMediaModeChange} />

        <a
          href="https://github.com/iurvish/uselayouts"
          target="_blank"
          rel="noreferrer"
          aria-label="useLayouts on GitHub"
          className="browse-press flex items-center rounded-[12px] border border-white/[0.12] p-[8px]"
        >
          <img src="/brand/icon-github.svg" alt="" width={18} height={18} className="size-[18px]" />
        </a>
      </div>
    </header>
  );
}
