"use client";

/* eslint-disable @next/next/no-img-element -- static SVG marks, no optimisation needed. */

import * as React from "react";
import Link from "next/link";

import { SearchIcon } from "./icons";

export function BrowseHeader({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
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
    <header className="flex w-full shrink-0 items-center justify-between px-[30px] py-2.5">
      <Link
        href="/"
        className="flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <img
          src="/brand/logo-wordmark.svg"
          alt="useLayouts"
          width={185}
          height={48}
          className="h-12 w-[185px]"
          draggable={false}
        />
      </Link>

      <div className="flex items-center gap-2.5">
        <div className="flex w-[180px] items-center justify-between rounded-xl bg-popover px-3 py-2 shadow-[0px_0.5px_0px_0px_rgba(255,255,255,0.15)] transition-[box-shadow] duration-150 ease-out focus-within:shadow-[0px_0.5px_0px_0px_rgba(255,255,255,0.28)] sm:w-[243px]">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
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
              className="min-w-0 flex-1 bg-transparent text-sm tracking-[-0.42px] text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          {focused || query ? null : (
            <kbd className="relative flex shrink-0 items-center justify-center rounded-md bg-[#212121] px-3 py-0.5 font-sans text-xs tracking-[-0.36px] text-muted-foreground shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.12)]">
              /
            </kbd>
          )}
        </div>

        <a
          href="https://github.com/iurvish/uselayouts"
          target="_blank"
          rel="noreferrer"
          aria-label="useLayouts on GitHub"
          className="browse-press relative flex items-center overflow-hidden rounded-xl bg-secondary p-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.1)]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-b from-transparent to-black/6 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)]"
          />
          <img src="/brand/icon-github.svg" alt="" width={20} height={20} className="relative size-5" />
        </a>
      </div>
    </header>
  );
}
