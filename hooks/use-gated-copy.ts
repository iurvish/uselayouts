"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

export type CopySource = "cli" | "code" | "manual_deps";

/**
 * Gate clipboard writes behind auth. Logs a copy_events row when signed in.
 */
export function useGatedCopy(options?: {
  componentSlug?: string;
  source?: CopySource;
}) {
  const { requireAuth, user } = useAuth();
  const slug = options?.componentSlug;
  const source = options?.source ?? "cli";

  return React.useCallback(
    async (text: string) => {
      const ok = await requireAuth();
      if (!ok) return false;

      await navigator.clipboard.writeText(text);

      if (isSupabaseConfigured() && user && slug) {
        try {
          const supabase = createClient();
          await supabase.from("copy_events").insert({
            user_id: user.id,
            component_slug: slug,
            source,
          });
        } catch {
          // Copy already succeeded — analytics must not block UX.
        }
      }

      return true;
    },
    [requireAuth, user, slug, source],
  );
}
