import { cn } from "@/lib/utils";

export const easeOut = "ease-[cubic-bezier(0.23,1,0.32,1)]";

export const openPress = cn(
  "transition-[transform,background-color,color,border-color] duration-150",
  easeOut,
  "motion-reduce:transition-none motion-reduce:active:scale-100",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/8",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:text-[#f7f7f7]",
  "[@media(hover:hover)_and_(pointer:fine)]:active:scale-[0.97]",
);

export const openIconBtn = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/5 p-0 text-[#f7f7f7]",
  openPress,
  "disabled:cursor-not-allowed disabled:opacity-40",
  "data-[active=true]:bg-[#2e2e2e]",
);

export const openCopyBtn = cn(
  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 text-xs text-[#bbb]",
  openPress,
);

export const scrollbarMinimal = cn(
  "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]",
  "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20",
);

export const scrollbarNone = cn(
  "[scrollbar-width:none] [&::-webkit-scrollbar]:[display:none]",
);
