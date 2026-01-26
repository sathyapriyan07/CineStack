import { getSessionAndProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { profile } = await getSessionAndProfile();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-white/70">
        Welcome back, {profile?.display_name ?? "Admin"}.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/85">Content</h2>
          <ul className="text-xs text-white/60">
            <li>Manage titles (movies and series)</li>
            <li>Add trailers, watch links and music links</li>
            <li>Curate home page sections with drag &amp; drop ordering</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/85">Realtime</h2>
          <p className="text-xs text-white/60">
            Changes to titles and home sections publish instantly and propagate
            to public pages via Supabase Realtime.
          </p>
        </div>
      </div>
    </div>
  );
}

