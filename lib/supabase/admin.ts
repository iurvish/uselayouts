import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseUrl } from "@/lib/supabase/env";

/** Server-only client for admin metadata sync. Returns null if unset. */
export function createServiceClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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
