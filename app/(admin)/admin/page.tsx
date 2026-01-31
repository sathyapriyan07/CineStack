import { getSessionAndProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { profile } = await getSessionAndProfile();

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-white/95 mb-2 tracking-tight">Dashboard</h1>
      <p className="mb-8 text-base text-white/80">
        Welcome back, {profile?.display_name ?? "Admin"}.
      </p>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="glass rounded-2xl p-8 shadow-xl">
          <h2 className="mb-3 text-lg font-semibold text-white/90">Content</h2>
          <ul className="text-sm text-white/70 space-y-1">
            <li>Manage titles (movies and series)</li>
            <li>Add trailers, watch links and music links</li>
            <li>Curate home page sections with drag & drop ordering</li>
          </ul>
        </div>
        <div className="glass rounded-2xl p-8 shadow-xl">
          <h2 className="mb-3 text-lg font-semibold text-white/90">Realtime</h2>
          <p className="text-sm text-white/70">
            Changes to titles and home sections publish instantly and propagate
            to public pages via Supabase Realtime.
          </p>
        </div>
      </div>
    </div>
  );
}

