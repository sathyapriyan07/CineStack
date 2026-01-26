-- Migration: Add missing fields to people and title_credits tables
-- Date: 2026-01-26

-- Add bio and slug to people table
alter table public.people
  add column if not exists bio text,
  add column if not exists slug text unique;

-- Create index on slug for faster lookups
create index if not exists people_slug_idx on public.people(slug);

-- Add billing_order and department to title_credits
alter table public.title_credits
  add column if not exists billing_order int default 0,
  add column if not exists department text;

-- Create index for sorting by billing order
create index if not exists title_credits_billing_order_idx on public.title_credits(title_id, billing_order);

-- Add admin_boost to titles table
alter table public.titles
  add column if not exists admin_boost int default 0;

-- Create index for trending queries
create index if not exists titles_admin_boost_idx on public.titles(admin_boost);

-- Update RLS policies remain the same (already exist in schema.sql)
