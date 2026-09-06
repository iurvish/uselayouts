-- Component catalog metadata (code/registry stay on filesystem for now).
create table public.components (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text,
  poster_url text,
  video_url text,
  dependencies text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index components_category_idx on public.components (category);

-- Auth-required copy tracking.
create table public.copy_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  component_slug text not null,
  source text not null default 'cli',
  created_at timestamptz not null default now()
);

create index copy_events_user_id_idx on public.copy_events (user_id);
create index copy_events_component_slug_idx on public.copy_events (component_slug);

alter table public.components enable row level security;
alter table public.copy_events enable row level security;

create policy "components are publicly readable"
  on public.components
  for select
  to anon, authenticated
  using (true);

create policy "users insert own copy events"
  on public.copy_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users read own copy events"
  on public.copy_events
  for select
  to authenticated
  using (auth.uid() = user_id);
