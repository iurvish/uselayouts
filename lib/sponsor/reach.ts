/** Audience numbers a sponsor is actually buying, from site analytics.
 *  Hand-updated: refresh `REACH_PERIOD` whenever you refresh the figures so
 *  the wall never quotes a stale month as if it were current. */
export const REACH_PERIOD = "Last 30 days";

const DAYS = 30;
const VISITORS = 43660;
const PAGE_VIEWS = 170258;

const int = (n: number) => Math.round(n).toLocaleString("en-US");

export type ReachStat = {
  label: string;
  value: string;
  /** One line on why a sponsor should care about this number. */
  hint: string;
};

export const REACH_STATS: readonly ReachStat[] = [
  {
    label: "Visitors",
    value: int(VISITORS),
    hint: "developers browsing the library",
  },
  {
    label: "Page Views",
    value: int(PAGE_VIEWS),
    hint: "impressions your logo sits beside",
  },
  {
    /** Same 30-day window as the others, so the period chip stays honest —
     *  and it is the number a sponsor actually buys: daily impressions. */
    label: "Views / Day",
    value: int(PAGE_VIEWS / DAYS),
    hint: "your logo, every single day",
  },
];
