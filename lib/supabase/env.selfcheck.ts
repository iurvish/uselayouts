import assert from "node:assert/strict";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./env";

// ponytail: one runnable check — fails if env helpers disagree with each other.
const url = getSupabaseUrl();
const key = getSupabaseAnonKey();
assert.equal(isSupabaseConfigured(), Boolean(url && key));

console.log("supabase env self-check ok", {
  configured: isSupabaseConfigured(),
  hasUrl: Boolean(url),
  hasKey: Boolean(key),
});
