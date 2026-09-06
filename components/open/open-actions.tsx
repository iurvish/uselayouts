"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import Link from "next/link";
import { SquarePen } from "lucide-react";

import { openIconBtn, openPressMotion } from "@/components/open/ui";
import { isDev } from "@/lib/admin/guard";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

/** Figma 91:4635 — primary code button; hover only bumps lightness ~2–4. */
export function OpenActions({
  panel,
  onChange,
  slug,
}: {
  panel: OpenPanel;
  onChange: (panel: OpenPanel) => void;
  /** Current component slug — used for admin edit link in development. */
  slug?: string;
}) {
  const active = panel === "code";
  const showAdminEdit = isDev() && Boolean(slug);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={cn(
          "inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 p-2.5 text-white",
          "bg-[hsl(230_77%_55%)]",
          "shadow-[inset_0_1px_0_0.2px_hsla(0,0%,100%,0.16),0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.12)]",
          "outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
          "transition-[transform,background-color,box-shadow] duration-150",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
          "active:bg-[hsl(230_77%_55%)]",
          openPressMotion,
        )}
        aria-label="Code"
        aria-pressed={active}
        onClick={() => onChange(active ? null : "code")}
      >
        <img src="/open/code.svg" alt="" width={22} height={22} className="size-[22px]" draggable={false} />
      </button>
      {showAdminEdit ? (
        <Link
          href={`/admin/${slug}`}
          className={cn(openIconBtn, "cursor-pointer")}
          aria-label="Edit in admin"
          title="Edit in admin"
        >
          <SquarePen className="size-[18px]" strokeWidth={1.75} />
        </Link>
      ) : null}
    </div>
  );
}
