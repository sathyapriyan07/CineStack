-- Add birth_date and other fields to people table
ALTER TABLE public.people
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS biography text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS death_date date,
ADD COLUMN IF NOT EXISTS birth_place text,
ADD COLUMN IF NOT EXISTS tmdb_id integer;

-- Add unique constraint on slug (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'people_slug_unique'
        AND table_name = 'people'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.people ADD CONSTRAINT people_slug_unique UNIQUE (slug);
    END IF;
END $$;

-- Add unique constraint on tmdb_id (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'people_tmdb_id_unique'
        AND table_name = 'people'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.people ADD CONSTRAINT people_tmdb_id_unique UNIQUE (tmdb_id);
    END IF;
END $$;

-- Update title_credits table to include more fields
ALTER TABLE public.title_credits
ADD COLUMN IF NOT EXISTS billing_order integer,
ADD COLUMN IF NOT EXISTS department text;