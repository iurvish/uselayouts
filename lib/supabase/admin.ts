import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseUrl } from "@/lib/supabase/env";

let serviceClient: SupabaseClient | null | undefined;

/** Server-only client for admin metadata sync. Returns null if unset. */
export function createServiceClient() {
  if (serviceClient !== undefined) return serviceClient;

  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    serviceClient = null;
    return null;
  }

  serviceClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serviceClient;
}

export async function upsertComponentRow(row: {
  slug: string;
  title: string;
  description?: string;
  category?: string | null;
  poster_url?: string | null;
  video_url?: string | null;
  dependencies?: string[];
}) {
  const supabase = createServiceClient();
  if (!supabase) return;

  await supabase.from("components").upsert(
    {
      slug: row.slug,
      title: row.title,
      description: row.description ?? "",
      category: row.category ?? null,
      poster_url: row.poster_url ?? null,
      video_url: row.video_url ?? null,
      dependencies: row.dependencies ?? [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );
}

/**
 * Public aggregate of copy_events with timestamps, keyed by registry slug.
 * `copies` alone cannot tell a component copied 50 times last week from one
 * copied 50 times last winter, so the admin views read `last_copied_at` too.
 */
export async function getComponentCopyStats(): Promise<
  Record<string, { copies: number; lastCopiedAt: string | null }>
> {
  const supabase = createServiceClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("component_copy_counts")
    .select("component_slug, copies, last_copied_at");

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [
      String(row.component_slug),
      {
        copies: Number(row.copies) || 0,
        lastCopiedAt:
          typeof row.last_copied_at === "string" ? row.last_copied_at : null,
      },
    ]),
  );
}

/** Public aggregate of copy_events, keyed by registry slug. */
export async function getComponentCopyCounts(): Promise<Record<string, number>> {
  const supabase = createServiceClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("component_copy_counts")
    .select("component_slug, copies");

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [String(row.component_slug), Number(row.copies) || 0]),
  );
}
