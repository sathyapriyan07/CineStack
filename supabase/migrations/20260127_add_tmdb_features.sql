-- Add TMDB-like features to existing schema
-- Date: January 27, 2026

-- Add rating, popularity, and vote_count fields to titles
ALTER TABLE public.titles
ADD COLUMN IF NOT EXISTS rating decimal(3,1) CHECK (rating >= 0 AND rating <= 10),
ADD COLUMN IF NOT EXISTS vote_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS popularity decimal(10,3) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS budget bigint,
ADD COLUMN IF NOT EXISTS revenue bigint,
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS homepage text,
ADD COLUMN IF NOT EXISTS imdb_id text,
ADD COLUMN IF NOT EXISTS production_companies text[],
ADD COLUMN IF NOT EXISTS production_countries text[],
ADD COLUMN IF NOT EXISTS spoken_languages text[];

-- Create collections/franchises table
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  overview text,
  poster_url text,
  backdrop_url text,
  tmdb_id integer UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add collection_id to titles
ALTER TABLE public.titles
ADD COLUMN IF NOT EXISTS collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS titles_rating_idx ON public.titles(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS titles_popularity_idx ON public.titles(popularity DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS titles_vote_count_idx ON public.titles(vote_count DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS titles_release_date_idx ON public.titles(release_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS titles_collection_id_idx ON public.titles(collection_id);

-- Enhanced media assets table (logos, multiple images)
ALTER TABLE public.media_uploads
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS region text;

-- Create logos table
CREATE TABLE IF NOT EXISTS public.logos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id uuid REFERENCES public.titles(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  aspect_ratio text,
  height integer,
  width integer,
  language text,
  region text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enhanced people table (known_for_department)
ALTER TABLE public.people
ADD COLUMN IF NOT EXISTS known_for_department text,
ADD COLUMN IF NOT EXISTS gender integer CHECK (gender IN (0, 1, 2, 3)), -- 0=not specified, 1=female, 2=male, 3=non-binary
ADD COLUMN IF NOT EXISTS also_known_as text[],
ADD COLUMN IF NOT EXISTS popularity decimal(10,3) DEFAULT 0.0;

-- Create person_images table for multiple profile images
CREATE TABLE IF NOT EXISTS public.person_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  aspect_ratio text,
  height integer,
  width integer,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enhanced title_credits (separate cast and crew tables for better structure)
CREATE TABLE IF NOT EXISTS public.cast (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  character_name text NOT NULL,
  billing_order integer,
  credit_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(title_id, person_id, character_name)
);

CREATE TABLE IF NOT EXISTS public.crew (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  department text NOT NULL,
  job text NOT NULL,
  credit_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(title_id, person_id, department, job)
);

-- Migrate existing title_credits to new structure
INSERT INTO public.cast (title_id, person_id, character_name, billing_order)
SELECT title_id, person_id, character_name, billing_order
FROM public.title_credits
WHERE role = 'cast' OR character_name IS NOT NULL;

INSERT INTO public.crew (title_id, person_id, department, job)
SELECT title_id, person_id, department, role
FROM public.title_credits
WHERE role != 'cast' AND character_name IS NULL AND department IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS cast_title_id_idx ON public.cast(title_id);
CREATE INDEX IF NOT EXISTS cast_person_id_idx ON public.cast(person_id);
CREATE INDEX IF NOT EXISTS cast_billing_order_idx ON public.cast(billing_order);
CREATE INDEX IF NOT EXISTS crew_title_id_idx ON public.crew(title_id);
CREATE INDEX IF NOT EXISTS crew_person_id_idx ON public.crew(person_id);
CREATE INDEX IF NOT EXISTS crew_department_idx ON public.crew(department);
CREATE INDEX IF NOT EXISTS crew_job_idx ON public.crew(job);
CREATE INDEX IF NOT EXISTS person_images_person_id_idx ON public.person_images(person_id);
CREATE INDEX IF NOT EXISTS logos_title_id_idx ON public.logos(title_id);

-- Update RLS policies for new tables
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_images ENABLE ROW LEVEL SECURITY;

-- Collections policies
DROP POLICY IF EXISTS "collections_public_read" ON public.collections;
CREATE POLICY "collections_public_read"
ON public.collections
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "collections_admin_all" ON public.collections;
CREATE POLICY "collections_admin_all"
ON public.collections
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Cast policies
DROP POLICY IF EXISTS "cast_public_read" ON public.cast;
CREATE POLICY "cast_public_read"
ON public.cast
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.titles t
    WHERE t.id = "cast".title_id
      AND t.is_published = true
  )
);

DROP POLICY IF EXISTS "cast_admin_all" ON public.cast;
CREATE POLICY "cast_admin_all"
ON public.cast
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Crew policies
DROP POLICY IF EXISTS "crew_public_read" ON public.crew;
CREATE POLICY "crew_public_read"
ON public.crew
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.titles t
    WHERE t.id = crew.title_id
      AND t.is_published = true
  )
);

DROP POLICY IF EXISTS "crew_admin_all" ON public.crew;
CREATE POLICY "crew_admin_all"
ON public.crew
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Logos policies
DROP POLICY IF EXISTS "logos_public_read" ON public.logos;
CREATE POLICY "logos_public_read"
ON public.logos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.titles t
    WHERE t.id = logos.title_id
      AND t.is_published = true
  )
);

DROP POLICY IF EXISTS "logos_admin_all" ON public.logos;
CREATE POLICY "logos_admin_all"
ON public.logos
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Person images policies
DROP POLICY IF EXISTS "person_images_public_read" ON public.person_images;
CREATE POLICY "person_images_public_read"
ON public.person_images
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "person_images_admin_all" ON public.person_images;
CREATE POLICY "person_images_admin_all"
ON public.person_images
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());