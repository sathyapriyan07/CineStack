-- CineStack schema + RLS (run in Supabase SQL Editor)

create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text check (role in ('admin','user')) default 'user',
  display_name text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'user', coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper: admin check
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- TITLES
create table if not exists public.titles (
  id uuid primary key default uuid_generate_v4(),
  type text check (type in ('movie','series')) not null,
  title text not null,
  original_title text,
  slug text not null unique,
  overview text,
  release_date date,
  runtime int,
  status text,
  age_rating text,
  languages text[] default '{}',
  country text,
  poster_url text,
  backdrop_url text,
  is_published boolean default true,
  tmdb_id int,
  created_by uuid references public.profiles(id),
  updated_at timestamptz default now()
);
create index if not exists titles_slug_idx on public.titles(slug);
create index if not exists titles_type_idx on public.titles(type);
create index if not exists titles_is_published_idx on public.titles(is_published);

-- GENRES
create table if not exists public.genres (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);

-- TITLE_GENRES
create table if not exists public.title_genres (
  title_id uuid references public.titles(id) on delete cascade,
  genre_id uuid references public.genres(id) on delete cascade,
  primary key (title_id, genre_id)
);

-- WATCH LINKS
create table if not exists public.watch_links (
  id uuid primary key default uuid_generate_v4(),
  title_id uuid not null references public.titles(id) on delete cascade,
  platform text not null,
  url text not null,
  region text,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- TRAILERS
create table if not exists public.trailers (
  id uuid primary key default uuid_generate_v4(),
  title_id uuid not null references public.titles(id) on delete cascade,
  youtube_url text not null,
  label text,
  created_at timestamptz default now()
);

-- MUSIC LINKS
create table if not exists public.music_links (
  id uuid primary key default uuid_generate_v4(),
  title_id uuid not null references public.titles(id) on delete cascade,
  platform text not null,
  url text not null,
  created_at timestamptz default now()
);

-- HOME SECTIONS
create table if not exists public.home_sections (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  title text not null,
  sort_order int not null default 0
);

create table if not exists public.home_section_items (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid not null references public.home_sections(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  rank int not null default 0
);
create index if not exists home_section_items_section_id_idx on public.home_section_items(section_id);
create index if not exists home_section_items_title_id_idx on public.home_section_items(title_id);

-- V2: PEOPLE / CREDITS
create table if not exists public.people (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  profile_image_url text
);

create table if not exists public.title_credits (
  id uuid primary key default uuid_generate_v4(),
  title_id uuid not null references public.titles(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  role text not null,
  character_name text
);

-- V2: RATINGS / WATCHLIST
create table if not exists public.ratings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  rating int not null check (rating between 1 and 10),
  created_at timestamptz default now(),
  unique (user_id, title_id)
);

create table if not exists public.watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, title_id)
);

-- --------------------
-- RLS
-- --------------------
alter table public.profiles enable row level security;
alter table public.titles enable row level security;
alter table public.genres enable row level security;
alter table public.title_genres enable row level security;
alter table public.watch_links enable row level security;
alter table public.trailers enable row level security;
alter table public.music_links enable row level security;
alter table public.home_sections enable row level security;
alter table public.home_section_items enable row level security;
alter table public.people enable row level security;
alter table public.title_credits enable row level security;
alter table public.ratings enable row level security;
alter table public.watchlist enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
on public.profiles
for select
using (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

-- TITLES
drop policy if exists "titles_public_read_published" on public.titles;
create policy "titles_public_read_published"
on public.titles
for select
using (is_published = true);

drop policy if exists "titles_admin_all" on public.titles;
create policy "titles_admin_all"
on public.titles
for all
using (public.is_admin())
with check (public.is_admin());

-- GENRES
drop policy if exists "genres_public_read" on public.genres;
create policy "genres_public_read"
on public.genres
for select
using (true);

drop policy if exists "genres_admin_all" on public.genres;
create policy "genres_admin_all"
on public.genres
for all
using (public.is_admin())
with check (public.is_admin());

-- TITLE_GENRES
drop policy if exists "title_genres_public_read" on public.title_genres;
create policy "title_genres_public_read"
on public.title_genres
for select
using (
  exists (
    select 1 from public.titles t
    where t.id = title_genres.title_id
      and t.is_published = true
  )
);

drop policy if exists "title_genres_admin_all" on public.title_genres;
create policy "title_genres_admin_all"
on public.title_genres
for all
using (public.is_admin())
with check (public.is_admin());

-- WATCH_LINKS
drop policy if exists "watch_links_public_read" on public.watch_links;
create policy "watch_links_public_read"
on public.watch_links
for select
using (
  exists (
    select 1 from public.titles t
    where t.id = watch_links.title_id
      and t.is_published = true
  )
);

drop policy if exists "watch_links_admin_all" on public.watch_links;
create policy "watch_links_admin_all"
on public.watch_links
for all
using (public.is_admin())
with check (public.is_admin());

-- TRAILERS
drop policy if exists "trailers_public_read" on public.trailers;
create policy "trailers_public_read"
on public.trailers
for select
using (
  exists (
    select 1 from public.titles t
    where t.id = trailers.title_id
      and t.is_published = true
  )
);

drop policy if exists "trailers_admin_all" on public.trailers;
create policy "trailers_admin_all"
on public.trailers
for all
using (public.is_admin())
with check (public.is_admin());

-- MUSIC_LINKS
drop policy if exists "music_links_public_read" on public.music_links;
create policy "music_links_public_read"
on public.music_links
for select
using (
  exists (
    select 1 from public.titles t
    where t.id = music_links.title_id
      and t.is_published = true
  )
);

drop policy if exists "music_links_admin_all" on public.music_links;
create policy "music_links_admin_all"
on public.music_links
for all
using (public.is_admin())
with check (public.is_admin());

-- HOME SECTIONS
drop policy if exists "home_sections_public_read" on public.home_sections;
create policy "home_sections_public_read"
on public.home_sections
for select
using (true);

drop policy if exists "home_sections_admin_all" on public.home_sections;
create policy "home_sections_admin_all"
on public.home_sections
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "home_section_items_public_read" on public.home_section_items;
create policy "home_section_items_public_read"
on public.home_section_items
for select
using (
  exists (
    select 1 from public.titles t
    where t.id = home_section_items.title_id
      and t.is_published = true
  )
);

drop policy if exists "home_section_items_admin_all" on public.home_section_items;
create policy "home_section_items_admin_all"
on public.home_section_items
for all
using (public.is_admin())
with check (public.is_admin());

-- PEOPLE / CREDITS
drop policy if exists "people_public_read" on public.people;
create policy "people_public_read"
on public.people
for select
using (true);

drop policy if exists "people_admin_all" on public.people;
create policy "people_admin_all"
on public.people
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "title_credits_public_read" on public.title_credits;
create policy "title_credits_public_read"
on public.title_credits
for select
using (
  exists (
    select 1 from public.titles t
    where t.id = title_credits.title_id
      and t.is_published = true
  )
);

drop policy if exists "title_credits_admin_all" on public.title_credits;
create policy "title_credits_admin_all"
on public.title_credits
for all
using (public.is_admin())
with check (public.is_admin());

-- RATINGS (users manage their own)
drop policy if exists "ratings_public_read" on public.ratings;
create policy "ratings_public_read"
on public.ratings
for select
using (true);

drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own"
on public.ratings
for insert
with check (auth.uid() = user_id);

drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own"
on public.ratings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ratings_delete_own" on public.ratings;
create policy "ratings_delete_own"
on public.ratings
for delete
using (auth.uid() = user_id);

-- WATCHLIST (users manage their own)
drop policy if exists "watchlist_select_own" on public.watchlist;
create policy "watchlist_select_own"
on public.watchlist
for select
using (auth.uid() = user_id);

drop policy if exists "watchlist_insert_own" on public.watchlist;
create policy "watchlist_insert_own"
on public.watchlist
for insert
with check (auth.uid() = user_id);

drop policy if exists "watchlist_delete_own" on public.watchlist;
create policy "watchlist_delete_own"
on public.watchlist
for delete
using (auth.uid() = user_id);

