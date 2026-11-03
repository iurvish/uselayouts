import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { CopyStats } from "@/lib/browse/ranking";

/**
 * Public copy totals for ranking.
 *
 * `component_copy_counts` is the published aggregate of `copy_events` — the
 * events table is per-user under RLS and cannot be counted from the client, so
 * a trigger maintains this table and grants it to anon. Read over PostgREST
 * rather than through supabase-js because this runs on a public page: the
 * client reads cookies, which would force /browse to render dynamically on
 * every request just to fetch numbers that change slowly.
 *
 * Fails soft. No Supabase, a network blip or a schema change returns {}, and
 * the catalogue still ranks — new first, then alphabetically — instead of
 * 500ing the page over a sort key.
 */
export async function getCopyStats(): Promise<CopyStats> {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return {};

  try {
    const res = await fetch(
      `${url}/rest/v1/component_copy_counts?select=component_slug,copies,last_copied_at`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 300, tags: ["copy-stats"] },
      },
    );
    if (!res.ok) return {};

    const rows = (await res.json()) as unknown;
    if (!Array.isArray(rows)) return {};

    const stats: CopyStats = {};
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const { component_slug: slug, copies, last_copied_at: last } = row as Record<
        string,
        unknown
      >;
      if (typeof slug !== "string" || !slug) continue;
      stats[slug] = {
        copies: Number(copies) || 0,
        lastCopiedAt: typeof last === "string" ? last : null,
      };
    }
    return stats;
  } catch {
    return {};
  }
}
