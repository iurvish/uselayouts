"use client";

/* eslint-disable @next/next/no-img-element -- static SVG marks, no optimisation needed. */

import * as React from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import { SearchIcon } from "./icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatStarCount, GITHUB_URL } from "@/lib/github";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/brand-logo";
import { ProfileDialog } from "@/components/account/profile-dialog";
import { UserAvatar } from "@/components/account/user-avatar";

/** Opens the profile dialog, which is also where the MCP key lives. */
function BrowseProfileButton({ user }: { user: User }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={user.email ? `Profile, signed in as ${user.email}` : "Profile"}
        title={user.email ?? "Profile"}
        className="cursor-pointer rounded-full transition-[transform,opacity] duration-150 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-85"
      >
        <UserAvatar user={user} />
      </button>
      <ProfileDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function BrowseHeader({
  query,
  onQueryChange,
  stars,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  stars?: number | null;
}) {
  const { user } = useAuth();
  const starCount = typeof stars === "number" ? formatStarCount(stars) : null;
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
        <BrandLogo invert />
      </Link>

      <div className="flex items-center gap-2.5">
        {/* Figma 82:3700 — px 12 / py 8 / radius 12 / bg #030202; hidden on mobile */}
        <div className="hidden w-[180px] items-center justify-between rounded-[12px] bg-[#030202] px-3 py-2 shadow-[0px_0.5px_0px_0px_rgba(255,255,255,0.15)] transition-[box-shadow] duration-150 ease-out focus-within:shadow-[0px_0.5px_0px_0px_rgba(255,255,255,0.28)] md:flex sm:w-[243px]">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SearchIcon className="size-4 shrink-0 text-[#acacb4]" />
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
              className="min-w-0 flex-1 bg-transparent text-sm tracking-[-0.42px] text-[#acacb4] outline-none placeholder:text-[#acacb4] [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          {focused || query ? null : (
            <kbd className="relative flex shrink-0 items-center justify-center rounded-[6px] bg-[#212121] px-3 py-0.5 font-sans text-xs tracking-[-0.36px] text-[#adadb7] shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.12)]">
              /
            </kbd>
          )}
        </div>

        {/* Figma 1:23 — mark plus count, gap 8 / px 10 / py 8. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={
                  starCount
                    ? `useLayouts on GitHub, ${starCount} stars`
                    : "useLayouts on GitHub"
                }
                className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-secondary px-2.5 py-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.1)] transition-colors duration-150 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_28%)]"
              />
            }
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-b from-transparent to-black/6 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)]"
            />
            <img
              src="/brand/icon-github.svg"
              alt=""
              width={20}
              height={20}
              className="relative size-5"
            />
            {starCount ? (
              <span className="relative text-base leading-none text-white tabular-nums">
                {starCount}
              </span>
            ) : null}
          </TooltipTrigger>
          <TooltipContent side="bottom">Star us on GitHub 🥹</TooltipContent>
        </Tooltip>

        {user ? <BrowseProfileButton user={user} /> : null}
      </div>
    </header>
  );
}
