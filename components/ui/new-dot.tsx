import { cn } from "@/lib/utils";

export function NewDot({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block size-1.5 shrink-0 rounded-full bg-emerald-400", className)}
      aria-hidden="true"
    />
  );
}
