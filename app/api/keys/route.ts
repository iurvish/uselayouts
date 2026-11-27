import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { displayPrefix, generateApiKey, hashApiKey } from "@/lib/mcp/keys";

/**
 * The signed-in visitor's MCP key. Every query runs on the cookie session, so
 * RLS, not this file, is what keeps one person out of another's key.
 */
async function session() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, user: data.user } : null;
}

const unauthorized = () =>
  NextResponse.json({ error: "Sign in to manage your API key." }, { status: 401 });

export async function GET() {
  const auth = await session();
  if (!auth) return unauthorized();

  const { data, error } = await auth.supabase
    .from("api_keys")
    .select("key_prefix, created_at, last_used_at")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    key: data
      ? { prefix: data.key_prefix, createdAt: data.created_at, lastUsedAt: data.last_used_at }
      : null,
  });
}

/** Generates a key, replacing any existing one. The plaintext leaves only here. */
export async function POST() {
  const auth = await session();
  if (!auth) return unauthorized();

  const secret = generateApiKey();

  // Delete then insert rather than update: RLS grants no update, and this way
  // the old key is gone before the new one can be used.
  const { error: deleteError } = await auth.supabase
    .from("api_keys")
    .delete()
    .eq("user_id", auth.user.id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const { data, error } = await auth.supabase
    .from("api_keys")
    .insert({
      user_id: auth.user.id,
      key_hash: hashApiKey(secret),
      key_prefix: displayPrefix(secret),
    })
    .select("key_prefix, created_at, last_used_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    secret,
    key: { prefix: data.key_prefix, createdAt: data.created_at, lastUsedAt: data.last_used_at },
  });
}

export async function DELETE() {
  const auth = await session();
  if (!auth) return unauthorized();

  const { error } = await auth.supabase.from("api_keys").delete().eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ key: null });
}
