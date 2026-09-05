import { cn } from "@/lib/utils";

export const easeOut = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/** Motion-only press feedback — does not change fill/text colors. */
export const openPressMotion = cn(
  "transition-[transform,box-shadow] duration-150",
  easeOut,
  "motion-reduce:transition-none motion-reduce:active:scale-100",
  "[@media(hover:hover)_and_(pointer:fine)]:active:scale-[0.97]",
);

/** Default chrome press: subtle accent fill on hover. */
export const openPress = cn(
  openPressMotion,
  "transition-[transform,background-color,color,border-color,box-shadow] duration-150",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:text-accent-foreground",
);

/** Soft Figma chrome elevation (buttons / panels) — no blue ring. */
export const openChromeShadow = cn(
  "shadow-[0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.14),0_0_0_1px_hsla(0,0%,0%,0.1)]",
);

export const openIconBtn = cn(
  "inline-flex size-[42px] shrink-0 items-center justify-center rounded-xl border-0 bg-[hsl(240_6%_22%)] p-2.5 text-foreground",
  openChromeShadow,
  openPressMotion,
  "outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_22%)]",
  "data-[active=true]:bg-[hsl(240_7%_26%)] data-[active=true]:text-foreground",
  "data-[active=true]:shadow-[0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.12)]",
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
