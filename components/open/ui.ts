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
  "relative inline-flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-0 p-2.5 text-foreground",
  "bg-[hsl(240_6%_22%)]",
  "shadow-[0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.1)]",
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
  "before:bg-[linear-gradient(180deg,transparent_0%,hsla(0,0%,0%,0.06)_100%)]",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
  "after:shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.05)]",
  "[&>*]:relative [&>*]:z-[1]",
  openPressMotion,
  "outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_22%)]",
  "data-[active=true]:bg-[hsl(240_6%_22%)] data-[active=true]:text-foreground",
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

/** Compact Shiki shell — same theme/token CSS as DocsCodeBlock body. */
export const shikiCommandSurface = cn(
  "open-shiki-surface min-w-0 overflow-x-auto",
  "[&_pre]:m-0 [&_pre]:min-w-0 [&_pre]:overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!py-0 [&_pre]:!px-0 [&_pre]:!pl-0",
  "[&_code]:bg-transparent [&_code]:!pl-0 [&_code]:!px-0",
  /* fumadocs .line gutter zeroed via .open-shiki-surface in globals.css */
  "[&_.shiki]:!m-0 [&_.shiki]:!pl-0 [&_.shiki]:![--padding-left:0px] [&_.shiki]:bg-transparent [&_.shiki]:font-mono [&_.shiki]:text-[13px] [&_.shiki]:leading-[19.5px] [&_.shiki_span]:!bg-transparent",
  "[&_.line]:!pl-0 [&_.line]:!pr-0",
);
