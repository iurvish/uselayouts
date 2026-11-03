import assert from "node:assert/strict";

import { latestBatch, rankComponents, type CopyStats } from "./ranking";

const DATES = {
  "new-a": "2026-10-07",
  "new-b": "2026-10-07",
  "new-c": "2026-10-06",
  "older": "2026-09-19",
  "ancient": "2025-12-24",
};
const NOW = new Date("2026-10-10T00:00:00Z").getTime();
const id = (item: { slug: string; title: string }) => item;

// Batch grouping: the 06th is within BATCH_DAYS of the 07th, the 19th of
// September is not.
const batch = latestBatch(DATES);
assert.deepEqual([...batch].sort(), ["new-a", "new-b", "new-c"]);
assert.equal(latestBatch({}).size, 0);

const items = Object.keys(DATES).map((slug) => ({ slug, title: slug }));
const rank = (stats: CopyStats) =>
  rankComponents(items, stats, id, { dates: DATES, now: NOW }).map((r) => r.slug);

// No copy data at all: new batch first, then newest-first, then alphabetical.
assert.deepEqual(rank({}), ["new-a", "new-b", "new-c", "older", "ancient"]);

// A heavily copied old component outranks a new one nobody has copied — the
// whole reason this is a blend and not two tiers.
const popular: CopyStats = {
  ancient: { copies: 310, lastCopiedAt: "2026-10-09T00:00:00Z" },
};
const withPopular = rank(popular);
assert.equal(withPopular[0], "ancient");
assert.ok(withPopular.indexOf("ancient") < withPopular.indexOf("new-a"));

// But a new component that is being copied beats that same old favourite.
const both: CopyStats = {
  ...popular,
  "new-a": { copies: 120, lastCopiedAt: "2026-10-09T00:00:00Z" },
};
assert.equal(rank(both)[0], "new-a");

// Trend decays: same copy count, staler last-copy ranks lower.
const stale: CopyStats = {
  older: { copies: 50, lastCopiedAt: "2026-10-09T00:00:00Z" },
  ancient: { copies: 50, lastCopiedAt: "2026-06-01T00:00:00Z" },
};
const byTrend = rank(stale);
assert.ok(byTrend.indexOf("older") < byTrend.indexOf("ancient"));

// A copy count with no usable timestamp still scores on copies alone, and a
// malformed date never produces NaN (which would scramble the whole sort).
const malformed: CopyStats = {
  older: { copies: 50, lastCopiedAt: "not-a-date" },
  ancient: { copies: 10, lastCopiedAt: null },
};
const ranked = rankComponents(items, malformed, id, { dates: DATES, now: NOW });
for (const row of ranked) assert.ok(Number.isFinite(row.score), `${row.slug} scored NaN`);
assert.ok(
  ranked.findIndex((r) => r.slug === "older") <
    ranked.findIndex((r) => r.slug === "ancient"),
);

// Ranking is a pure read: it must not reorder or mutate the input array.
const input = [...items];
rankComponents(input, {}, id, { dates: DATES, now: NOW });
assert.deepEqual(input.map((i) => i.slug), items.map((i) => i.slug));

// An undated component still ranks rather than vanishing.
const extra = [...items, { slug: "undated", title: "undated" }];
assert.equal(
  rankComponents(extra, {}, id, { dates: DATES, now: NOW }).length,
  extra.length,
);

console.log("ranking self-check ok");
