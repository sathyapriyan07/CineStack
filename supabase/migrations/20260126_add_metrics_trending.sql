-- Migration: Create title_metrics_daily table for tracking views/clicks
-- Date: 2026-01-26

create table if not exists public.title_metrics_daily (
  id uuid primary key default uuid_generate_v4(),
  title_id uuid not null references public.titles(id) on delete cascade,
  metric_date date not null default current_date,
  views int default 0,
  clicks int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (title_id, metric_date)
);

-- Indexes for efficient queries
create index if not exists title_metrics_daily_title_id_idx on public.title_metrics_daily(title_id);
create index if not exists title_metrics_daily_date_idx on public.title_metrics_daily(metric_date);
create index if not exists title_metrics_daily_title_date_idx on public.title_metrics_daily(title_id, metric_date);

-- Enable RLS
alter table public.title_metrics_daily enable row level security;

-- RLS Policies
-- Public can read metrics (for trending calculations)
drop policy if exists "title_metrics_daily_public_read" on public.title_metrics_daily;
create policy "title_metrics_daily_public_read"
on public.title_metrics_daily
for select
using (true);

-- Only admins can insert/update/delete metrics
drop policy if exists "title_metrics_daily_admin_all" on public.title_metrics_daily;
create policy "title_metrics_daily_admin_all"
on public.title_metrics_daily
for all
using (public.is_admin())
with check (public.is_admin());

-- Function to update updated_at timestamp
create or replace function update_title_metrics_daily_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to auto-update updated_at
drop trigger if exists title_metrics_daily_updated_at on public.title_metrics_daily;
create trigger title_metrics_daily_updated_at
before update on public.title_metrics_daily
for each row
execute function update_title_metrics_daily_updated_at();

-- Function to increment view count (for API route)
create or replace function increment_title_view(p_title_id uuid, p_date date)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.title_metrics_daily (title_id, metric_date, views)
  values (p_title_id, p_date, 1)
  on conflict (title_id, metric_date)
  do update set views = title_metrics_daily.views + 1, updated_at = now();
end;
$$;

-- Grant execute permission to public (for anonymous API calls)
grant execute on function increment_title_view(uuid, date) to public;
