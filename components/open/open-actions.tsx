"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import Link from "next/link";
import { Pencil } from "lucide-react";

import { openPressMotion } from "@/components/open/ui";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

const actionBtnClass = cn(
  "inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 p-2.5 text-white",
  "bg-[hsl(230_77%_55%)]",
  "shadow-[inset_0_1px_0_0.2px_hsla(0,0%,100%,0.16),0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.12)]",
  "outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
  "transition-[transform,background-color,box-shadow] duration-150",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
  "active:bg-[hsl(230_77%_55%)]",
  openPressMotion,
);

/** Figma 91:4635 — primary code button; hover only bumps lightness ~2–4. */
export function OpenActions({
  panel,
  onChange,
  slug,
}: {
  panel: OpenPanel;
  onChange: (panel: OpenPanel) => void;
  slug: string;
}) {
  const active = panel === "code";

  return (
    <div className="flex items-center gap-2">
      {process.env.NODE_ENV === "development" ? (
        <Link href={`/admin/${slug}`} className={actionBtnClass} aria-label="Edit">
          <Pencil className="size-[22px]" />
        </Link>
      ) : null}
      <button
        type="button"
        className={actionBtnClass}
        aria-label="Code"
        aria-pressed={active}
        onClick={() => onChange(active ? null : "code")}
      >
        <img src="/open/code.svg" alt="" width={22} height={22} className="size-[22px]" draggable={false} />
      </button>
    </div>
  );
}
