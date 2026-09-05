import { cn } from "@/lib/utils";

export const easeOut = "ease-[cubic-bezier(0.23,1,0.32,1)]";

export const openPress = cn(
  "transition-[transform,background-color,color,border-color,box-shadow] duration-150",
  easeOut,
  "motion-reduce:transition-none motion-reduce:active:scale-100",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:text-accent-foreground",
  "[@media(hover:hover)_and_(pointer:fine)]:active:scale-[0.97]",
);

/** Soft Figma chrome elevation (buttons / panels) — no blue ring. */
export const openChromeShadow = cn(
  "shadow-[0_2px_2px_-1px_rgba(0,0,0,0.16),0_4px_4px_-2px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.1)]",
);

export const openIconBtn = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border-0 bg-secondary p-0 text-foreground",
  openChromeShadow,
  openPress,
  "outline-none focus-visible:outline-none focus-visible:ring-0",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent",
  "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
  "data-[active=true]:shadow-[0_2px_2px_-1px_rgba(0,0,0,0.16),0_4px_4px_-2px_rgba(0,0,0,0.24),0_0_0_1px_rgba(0,0,0,0.12)]",
);

export const openCopyBtn = cn(
  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 text-xs text-muted-foreground",
  openPress,
  "outline-none focus-visible:outline-none focus-visible:ring-0",
);

export const scrollbarMinimal = cn(
  "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--foreground)_18%,transparent)_transparent]",
  "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20",
);

export const scrollbarNone = cn(
  "[scrollbar-width:none] [&::-webkit-scrollbar]:[display:none]",
);
