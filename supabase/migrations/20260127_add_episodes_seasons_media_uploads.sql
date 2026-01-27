-- Add episodes and seasons support for series
-- Plus media upload and content update tracking

-- SEASONS (for series)
create table if not exists public.seasons (
  id uuid primary key default uuid_generate_v4(),
  title_id uuid not null references public.titles(id) on delete cascade,
  season_number int not null,
  title text,
  overview text,
  poster_url text,
  release_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (title_id, season_number)
);
create index if not exists seasons_title_id_idx on public.seasons(title_id);
create index if not exists seasons_season_number_idx on public.seasons(season_number);

-- EPISODES (for series)
create table if not exists public.episodes (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  episode_number int not null,
  title text not null,
  overview text,
  runtime int,
  air_date date,
  still_url text,
  video_url text,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (season_id, episode_number)
);
create index if not exists episodes_season_id_idx on public.episodes(season_id);
create index if not exists episodes_title_id_idx on public.episodes(title_id);
create index if not exists episodes_episode_number_idx on public.episodes(episode_number);

-- MEDIA UPLOADS (for admin uploads)
create table if not exists public.media_uploads (
  id uuid primary key default uuid_generate_v4(),
  title_id uuid references public.titles(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete cascade,
  episode_id uuid references public.episodes(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null, -- 'poster', 'backdrop', 'still', 'video', 'trailer'
  file_size int,
  mime_type text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
create index if not exists media_uploads_title_id_idx on public.media_uploads(title_id);
create index if not exists media_uploads_season_id_idx on public.media_uploads(season_id);
create index if not exists media_uploads_episode_id_idx on public.media_uploads(episode_id);

-- CONTENT UPDATES (for tracking changes)
create table if not exists public.content_updates (
  id uuid primary key default uuid_generate_v4(),
  title_id uuid references public.titles(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete cascade,
  episode_id uuid references public.episodes(id) on delete cascade,
  update_type text not null, -- 'create', 'update', 'delete', 'publish', 'unpublish'
  field_name text, -- which field was updated
  old_value text,
  new_value text,
  updated_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
create index if not exists content_updates_title_id_idx on public.content_updates(title_id);
create index if not exists content_updates_created_at_idx on public.content_updates(created_at);

-- Enable RLS
alter table public.seasons enable row level security;
alter table public.episodes enable row level security;
alter table public.media_uploads enable row level security;
alter table public.content_updates enable row level security;

-- RLS Policies
-- SEASONS
drop policy if exists "seasons_public_read" on public.seasons;
create policy "seasons_public_read"
on public.seasons
for select
using (
  exists (
    select 1 from public.titles t
    where t.id = seasons.title_id
      and t.is_published = true
  )
);

drop policy if exists "seasons_admin_all" on public.seasons;
create policy "seasons_admin_all"
on public.seasons
for all
using (public.is_admin())
with check (public.is_admin());

-- EPISODES
drop policy if exists "episodes_public_read" on public.episodes;
create policy "episodes_public_read"
on public.episodes
for select
using (
  exists (
    select 1 from public.titles t
    where t.id = episodes.title_id
      and t.is_published = true
      and episodes.is_published = true
  )
);

drop policy if exists "episodes_admin_all" on public.episodes;
create policy "episodes_admin_all"
on public.episodes
for all
using (public.is_admin())
with check (public.is_admin());

-- MEDIA UPLOADS
drop policy if exists "media_uploads_admin_all" on public.media_uploads;
create policy "media_uploads_admin_all"
on public.media_uploads
for all
using (public.is_admin())
with check (public.is_admin());

-- CONTENT UPDATES
drop policy if exists "content_updates_admin_all" on public.content_updates;
create policy "content_updates_admin_all"
on public.content_updates
for all
using (public.is_admin())
with check (public.is_admin());