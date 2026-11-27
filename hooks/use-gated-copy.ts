"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { copyEventSlug } from "@/lib/open/package-manager";
import { createClient } from "@/lib/supabase/client";

export type CopySource = "cli" | "code" | "manual_deps" | "mcp";

function queueCopyEvent(userId: string, slug: string, source: CopySource) {
  void createClient()
    .from("copy_events")
    .insert({
      user_id: userId,
      component_slug: slug,
      source,
    })
    .then(({ error }) => {
      if (error) console.error("copy_events insert failed", error.message);
    });
}

/**
 * Gate clipboard writes behind auth. Logs a copy_events row when signed in.
 * Insert is fire-and-forget so copy UI does not wait on PostgREST.
 */
export function useGatedCopy(options?: {
  componentSlug?: string;
  source?: CopySource;
}) {
  const { requireAuth, user, configured } = useAuth();
  const slug = options?.componentSlug
    ? copyEventSlug(options.componentSlug)
    : undefined;
  const source = options?.source ?? "cli";

  return React.useCallback(
    async (text: string) => {
      const ok = await requireAuth();
      if (!ok) return false;

      await navigator.clipboard.writeText(text);

      if (configured && user && slug) {
        queueCopyEvent(user.id, slug, source);
      }

      return true;
    },
    [requireAuth, configured, user, slug, source],
  );
}
