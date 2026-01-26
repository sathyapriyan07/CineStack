# Setup & Run Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase project (create one at https://supabase.com)
- npm or yarn package manager

## Step 1: Clone/Download Project

If you haven't already, ensure you have the project files.

## Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including Next.js, Supabase, React, etc.

## Step 3: Set Up Environment Variables

1. Copy the example env file:
   ```bash
   # Windows
   copy env.example .env.local
   
   # Mac/Linux
   cp env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   TMDB_API_KEY=your_tmdb_api_key (optional, for TMDB import feature)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Where to find these:**
   - Go to your Supabase project dashboard
   - Settings → API
   - Copy the Project URL and anon/public key
   - Copy the service_role key (keep this secret!)

## Step 4: Set Up Supabase Database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the following SQL files **in order**:

   **a) Base Schema:**
   - Copy and paste contents of `supabase/schema.sql`
   - Click **Run** (or press Ctrl+Enter)

   **b) People & Credits Migration:**
   - Copy and paste contents of `supabase/migrations/20260126_add_people_credits.sql`
   - Click **Run**

   **c) Metrics & Trending Migration:**
   - Copy and paste contents of `supabase/migrations/20260126_add_metrics_trending.sql`
   - Click **Run**

4. **Enable Realtime** (if not already enabled):
   - Go to **Database** → **Replication**
   - Enable replication for these tables:
     - `titles`
     - `home_section_items`
     - `title_metrics_daily`
     - `ratings`
     - `title_credits`
     - `people`

5. **Create Storage Bucket** (for image uploads):
   - Go to **Storage**
   - Create a new bucket named `media`
   - Set it to **Public** (for easiest image hosting)
   - Or keep it private and configure policies accordingly

## Step 5: Create Admin User

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add user** → **Create new user**
3. Enter email and password (or use email magic link)
4. Note the user's UUID (found in the users table)

5. Go to **SQL Editor** and run:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id = 'your-user-uuid-here';
   ```

   Or manually edit the `profiles` table:
   - Go to **Table Editor** → `profiles`
   - Find your user row
   - Change `role` from `user` to `admin`

## Step 6: Run the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Step 7: Access the Application

- **Public Site:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login
- **User Login:** http://localhost:3000/login

## Step 8: Initial Testing

### Test Admin Features:

1. **Login as Admin:**
   - Go to `/admin/login`
   - Use the email/password you created

2. **Create Genres:**
   - Go to `/admin/genres`
   - Add a few genres (e.g., "Action", "Drama", "Comedy")

3. **Create People:**
   - Go to `/admin/people`
   - Add actors/directors with name, bio, slug

4. **Create Titles:**
   - Go to `/admin/titles`
   - Click "New Title"
   - Fill in details (title, type, etc.)
   - Optionally use "Import from TMDB" button
   - Set `admin_boost` value (for trending)
   - Add credits (cast & crew) with billing orders
   - Save

5. **Create Home Sections:**
   - Go to `/admin/home-sections`
   - Create sections and add titles

### Test Public Features:

1. **View Home Page:**
   - Go to `/`
   - See "Trending Now" and "Top Rated" sections
   - See curated home sections

2. **Browse Titles:**
   - Go to `/titles`
   - Use filters (search, type, year, language)

3. **View Title Detail:**
   - Click on any title
   - See cast & crew
   - Click "See all cast & crew" link
   - View should be tracked automatically

4. **View Person Page:**
   - Click on a person's name from credits
   - See their filmography

5. **Rate Titles:**
   - Login as a regular user (create one at `/login`)
   - Go to a title page
   - Select a rating (1-10)
   - Check if it appears in "Top Rated" section

## Step 9: Verify Realtime Updates

1. Open two browser tabs:
   - Tab 1: Public home page (`/`)
   - Tab 2: Admin panel (`/admin/home-sections`)

2. In admin tab:
   - Reorder items in a home section
   - Click "Save order"

3. In public tab:
   - The home page should update automatically without refresh!

4. Test trending updates:
   - Visit a title page (increments view count)
   - Change `admin_boost` in admin panel
   - Check if "Trending Now" updates

## Troubleshooting

### Database Errors:
- Ensure all migrations ran successfully
- Check RLS policies are enabled
- Verify you're using the correct Supabase project

### Font Not Loading:
- Restart the dev server after font changes
- Clear browser cache

### Realtime Not Working:
- Check Realtime is enabled in Supabase dashboard
- Verify tables have replication enabled
- Check browser console for errors

### API Errors:
- Verify `.env.local` has correct Supabase credentials
- Check Supabase project is active (not paused)
- Ensure RLS policies allow the operations you're trying

### Admin Access Denied:
- Verify user has `role = 'admin'` in `profiles` table
- Check middleware.ts is not blocking access
- Try logging out and back in

## Production Deployment

When ready to deploy:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Test production build locally:**
   ```bash
   npm start
   ```

3. **Deploy to Vercel:**
   - Push code to GitHub
   - Import project in Vercel
   - Add environment variables in Vercel dashboard
   - Deploy!

4. **Update Supabase URLs:**
   - Update `NEXT_PUBLIC_APP_URL` in production environment
   - Configure CORS if needed

## Quick Reference

- **Database Schema:** `supabase/schema.sql`
- **Migrations:** `supabase/migrations/`
- **Admin Routes:** `/admin/*` (protected by middleware)
- **Public Routes:** `/`, `/titles`, `/titles/[slug]`, `/person/[slug]`
- **API Routes:** `/api/titles/[id]/view` (POST - tracks views)

## Need Help?

- Check `IMPLEMENTATION_SUMMARY.md` for feature details
- Review Supabase logs in dashboard
- Check browser console for client-side errors
- Check terminal for server-side errors
