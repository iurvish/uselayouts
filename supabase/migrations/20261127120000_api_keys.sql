-- Personal API keys for the hosted MCP endpoint (/api/mcp).
--
-- One key per person: the dialog offers generate, copy, regenerate and revoke,
-- and a second key would only be a second thing to lose. Regenerating replaces
-- the row, so the old key stops working the moment the new one exists.
--
-- Only a SHA-256 of the key is stored. The plaintext is shown once, in the
-- response that created it, and never again.
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  key_hash text not null unique,
  -- "ul_a1b2c3d4", enough to recognise a key without being able to use it.
  key_prefix text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.api_keys enable row level security;

-- Owners manage their own row through the cookie session. The MCP route looks
-- keys up by hash with the service role, which bypasses these.
create policy "owners read their key"
  on public.api_keys
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "owners create their key"
  on public.api_keys
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "owners revoke their key"
  on public.api_keys
  for delete
  to authenticated
  using (auth.uid() = user_id);
