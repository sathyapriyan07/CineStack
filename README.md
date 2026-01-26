# CineStack (Admin-managed IMDb/TMDB-style app)

Production-ready starter for a Movies/Series web app where **all data is admin-managed** (manual upload via admin panel). Optional **TMDB autofill** for admins.

## Tech

- Next.js App Router + TypeScript + Tailwind
- Supabase (Postgres, Auth, Storage, Realtime)

## Setup (Supabase)

1. Create a Supabase project.
2. In Supabase **SQL Editor**, run:
   - `supabase/schema.sql`
3. Enable Realtime for tables:
   - `titles`, `home_section_items`, `watch_links`, `trailers`, `music_links`
4. Create Storage bucket:
   - `media` (recommended public for easiest image hosting)

## Setup (Next.js)

1. Install deps:

```bash
npm install
```

2. Create `.env.local` (copy from `env.example`):

```bash
copy env.example .env.local
```

Fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `TMDB_API_KEY` (optional; required only for “Import from TMDB”)

3. Run:

```bash
npm run dev
```

Open:
- Public site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## Admin bootstrap

1. Create a user in Supabase Auth (or sign up at `/login`).
2. In table `public.profiles`, set:
   - `role = 'admin'` for that user id
3. Log in at `/admin/login`.

## What’s implemented

### Public
- Home page with curated sections + realtime updates
- Browse titles with search/type/year/language filters + pagination
- Title detail: poster/backdrop, metadata, trailer/watch/music CTAs
- v2 user features:
  - Watchlist page (`/watchlist`)
  - Ratings page (`/ratings`)
  - “Add to watchlist” + rating selector on title detail

### Admin
- Titles CRUD (`/admin/titles`)
  - Optional “Import from TMDB” (server-side API routes)
  - Poster/backdrop URL or upload to Supabase Storage bucket `media`
  - Genres assignment
  - Manage trailers, watch links, music links
- Genres CRUD (`/admin/genres`)
- Home sections (`/admin/home-sections`)
  - Create sections
  - Add/remove titles to sections
  - Drag-drop reorder + save rank

## Security

- Supabase Auth for users/admins
- `profiles.role` controls admin privileges
- RLS policies in `supabase/schema.sql`
  - Public reads only `titles.is_published = true` (+ related data)
  - Only admins can write admin-managed tables
  - Users can write only their own `watchlist` and `ratings`
- Admin routes protected by `middleware.ts` (server-side)

## Short test plan

1. Run `supabase/schema.sql`.
2. Create a user and set `profiles.role = 'admin'`.
3. Log in at `/admin/login`.
4. Create a few genres and titles; add trailers/watch/music links.
5. Create home sections (e.g. `top-movies`, `top-series`) and add titles.
6. Open `/` in another tab; reorder items in admin and click “Save order”:
   - verify the home page updates without a manual refresh (Realtime).
7. Sign up as a normal user at `/login`, add watchlist items and ratings.
8. Verify RLS:
   - anon/non-admin cannot insert/update/delete titles/sections/genres.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
