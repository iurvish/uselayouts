import { cn } from "@/lib/utils";

const DOTS = [
  [4.5, 4.5],
  [15.3379, 4.5],
  [9.91992, 9.91895],
  [20.7578, 9.91895],
  [4.5, 15.3379],
  [15.3379, 15.3379],
  [9.91992, 20.7578],
  [20.7578, 20.7578],
] as const;

export function BrandLogo({
  invert = false,
  className,
}: {
  invert?: boolean;
  className?: string;
}) {
  const bg = invert ? "#fff" : "#14141A";
  const fg = invert ? "#14141A" : "#fff";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        className="size-[30px] shrink-0"
        aria-hidden
      >
        <rect width="30" height="30" rx="6" fill={bg} />
        {DOTS.map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="4.74182"
            height="4.74182"
            rx="0.8"
            fill={fg}
          />
        ))}
      </svg>
      <span
        className={cn(
          "font-[family-name:var(--font-geist-sans)] text-[18px] leading-none font-medium tracking-[-0.02em]",
          invert ? "text-white" : "text-[#14141A]",
        )}
      >
        useLayouts
      </span>
    </span>
  );
}
