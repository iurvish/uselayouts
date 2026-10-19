import { cn } from "@/lib/utils";

/** Radius per cell of dotstore's 7×7 dot matrix, row by row. A 0 is a gap —
 *  the four corners are empty, which is what rounds the mark off. Transcribed
 *  from the brand's own SVG so the optical weights survive. */
const DOTSTORE_GRID = [
  [0, 0.238, 0.365, 0.4, 0.365, 0.238, 0],
  [0.238, 0.4, 0.4, 0.4, 0.4, 0.4, 0.238],
  [0.365, 0.4, 0.4, 0.4, 0.4, 0.4, 0.365],
  [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
  [0.365, 0.4, 0.4, 0.4, 0.4, 0.4, 0.365],
  [0.238, 0.4, 0.4, 0.4, 0.4, 0.4, 0.238],
  [0, 0.238, 0.365, 0.4, 0.365, 0.238, 0],
] as const;

/** dotstore (dotstore.io) — inherits `currentColor` so the one mark reads on
 *  the light sponsor wall and the dark browse dock alike. */
export function DotstoreLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 7 7"
      fill="currentColor"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      {DOTSTORE_GRID.flatMap((row, y) =>
        row.map((r, x) =>
          r === 0 ? null : (
            <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={r} />
          ),
        ),
      )}
    </svg>
  );
}

/** The Internet Designs mark: eight rounded squares, each rotated 45° about
 *  its own top-left corner. Geometry is verbatim from
 *  /public/sponsor/internet-designs.svg — [x, y, side]. */
const INTERNET_DESIGNS_TILES = [
  [209.914, 128.746, 46.2951],
  [209.914, 189.307, 34.7213],
  [209.914, 51.627, 57.8689],
  [141.609, 119.932, 57.8689],
  [141.609, 59.8125, 46.2951],
  [73.3047, 128.117, 46.2951],
  [141.609, 196.42, 46.2951],
  [89.6758, 68, 34.7213],
] as const;

/** The Internet Designs (theinternetdesigns.com). Inlined rather than served
 *  from /public because the source file carries an opaque near-white
 *  background that would sit as a pale box on the dark browse dock; the
 *  viewBox is cropped to the artwork's true square bounds so this mark sits at
 *  the same optical size as its neighbours. */
export function InternetDesignsLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="40.57 51.63 210.26 210.26"
      fill="currentColor"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      {INTERNET_DESIGNS_TILES.map(([x, y, size]) => (
        <rect
          key={`${x}-${y}-${size}`}
          x={x}
          y={y}
          width={size}
          height={size}
          rx={4.2806}
          transform={`rotate(45 ${x} ${y})`}
        />
      ))}
    </svg>
  );
}

export const SPONSOR_LOGOS = {
  dotstore: DotstoreLogo,
  "internet-designs": InternetDesignsLogo,
} as const;

export type SponsorLogoId = keyof typeof SPONSOR_LOGOS;

export function isSponsorLogoId(value: string): value is SponsorLogoId {
  return value in SPONSOR_LOGOS;
}
