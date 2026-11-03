import componentDates from "@/registry/default/component-dates.json";

/**
 * One ordering for the catalogue, used by the browse grid, the infinite canvas
 * and the admin list, so the three can never disagree about what is doing well.
 *
 * Three signals, blended rather than tiered. Tiers would park every new
 * component above every proven one, which is how a dud that shipped on Tuesday
 * ends up above the most copied component on the site. A blend lets a genuinely
 * popular component outrank a new-but-ignored one, while a new component that
 * people are actually copying goes straight to the top.
 */

/** Copy totals keyed by registry slug, plus when each was last copied. */
export type CopyStat = { copies: number; lastCopiedAt?: string | null };
export type CopyStats = Record<string, CopyStat>;

export const DATES = componentDates as Record<string, string>;

/**
 * A new component is one from the most recent batch, not one inside a rolling
 * window: these land in clusters of four to fifteen on a single day, so a
 * calendar window is either empty for weeks or suddenly holds fifteen.
 * Anything within BATCH_DAYS of the newest date counts as the same batch, so a
 * drop spread over a couple of days is not split in half.
 */
const BATCH_DAYS = 3;
const DAY_MS = 86_400_000;

/**
 * Weights, calibrated against the real catalogue rather than guessed.
 *
 * W_NEW is the cold-start credit: what a component with no copies yet is
 * assumed to be worth. At 1 it reads as "assume it would top the catalogue
 * until the numbers say otherwise", which lands a new component just behind
 * the few proven favourites rather than at the back. A new component cannot
 * have copies — it has not had time — so without this credit it sorts below
 * everything ever copied, which is where the first cut of this put all four of
 * the October batch: positions 63 to 66 of 68. Raise it above ~1.15 and new
 * components pin to the very top; drop it to 0.5 and they sit mid-catalogue.
 *
 * The trend term is small on purpose. 61 of the 64 copied components were last
 * copied inside a fortnight (median: two days), so "copied recently" is true of
 * nearly everything and separates almost nothing. At this weight it breaks ties
 * between components on similar totals instead of inflating every score.
 */
const W_NEW = 1;
const W_COPIES = 1;
const W_TREND = 0.12;
/** Days for the trend term to fall to half — how fast "recently copied" fades. */
const TREND_HALF_LIFE = 7;

function time(date: string | null | undefined) {
  if (!date) return NaN;
  const ms = new Date(date).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

/** Slugs in the most recent batch. Empty if no dates are on file. */
export function latestBatch(dates: Record<string, string> = DATES): Set<string> {
  const stamps = Object.values(dates).map(time).filter(Number.isFinite);
  if (stamps.length === 0) return new Set();
  const newest = Math.max(...stamps);
  const cutoff = newest - BATCH_DAYS * DAY_MS;
  return new Set(
    Object.entries(dates)
      .filter(([, date]) => {
        const ms = time(date);
        return Number.isFinite(ms) && ms >= cutoff;
      })
      .map(([slug]) => slug),
  );
}

/** How many entries in a sorted array are strictly less than `value`. */
function lowerCount(sorted: readonly number[], value: number) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((sorted[mid] ?? 0) < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export type Ranked<T> = T & { score: number; isNew: boolean; copies: number };

/**
 * Scores and sorts. `now` is injectable so the self-check can pin a date
 * instead of drifting with the clock.
 */
export function rankComponents<T>(
  items: readonly T[],
  stats: CopyStats,
  get: (item: T) => { slug: string; title: string },
  options?: { dates?: Record<string, string>; now?: number },
): Ranked<T>[] {
  const dates = options?.dates ?? DATES;
  const now = options?.now ?? Date.now();
  const fresh = latestBatch(dates);

  // Score copies by where they place among the other components, not as a
  // fraction of the highest total. Dividing by the max (even through a log)
  // squashed the field: with a top of 86 copies the median component still
  // scored 0.71, so the whole catalogue sat in a narrow high band that no
  // cold-start credit could reach into. A percentile spreads the same numbers
  // evenly, and keeps working whether the leader has 9 copies or 9000.
  const counts = items
    .map((item) => stats[get(item).slug]?.copies ?? 0)
    .sort((a, b) => a - b);

  return items
    .map((item) => {
      const { slug } = get(item);
      const stat = stats[slug];
      const copies = stat?.copies ?? 0;
      const isNew = fresh.has(slug);

      // Share of the catalogue this component is strictly ahead of. Ties sit
      // together, and a component nobody has copied scores 0.
      const copiesTerm =
        counts.length > 1 ? lowerCount(counts, copies) / (counts.length - 1) : 0;

      // Only a component that has actually been copied gets a trend score;
      // without this, every never-copied component would read as "last copied
      // at the epoch" and the term would be a constant 0 anyway, but an
      // explicit guard keeps a bad timestamp from scoring.
      const last = time(stat?.lastCopiedAt);
      const trendTerm =
        copies > 0 && Number.isFinite(last)
          ? Math.pow(2, -Math.max(0, now - last) / (TREND_HALF_LIFE * DAY_MS))
          : 0;

      return {
        ...item,
        isNew,
        copies,
        score:
          (isNew ? W_NEW : 0) + W_COPIES * copiesTerm + W_TREND * trendTerm,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Equal scores means equal evidence — fall back to newest first, then
      // alphabetically, so the order is stable across renders and deploys
      // instead of depending on however the input happened to arrive.
      const byDate = (time(dates[get(b).slug]) || 0) - (time(dates[get(a).slug]) || 0);
      if (byDate !== 0) return byDate;
      return get(a).title.localeCompare(get(b).title);
    });
}
