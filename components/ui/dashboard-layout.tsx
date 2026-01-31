import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAndProfile } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { session, profile } = await getSessionAndProfile();

  if (!session) {
    redirect("/admin-login");
  }
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900/80 to-black">
      <div className="mx-auto flex flex-col md:flex-row max-w-7xl gap-8 px-2 md:px-8 py-8">
        {/* Frosted Sidebar */}
        <aside className="w-full md:w-64 glass rounded-2xl p-6 text-base mb-6 md:mb-0 shadow-2xl flex flex-col gap-8">
          <div>
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-white/60 hidden md:block">
              Admin Panel
            </h2>
            <nav className="flex flex-row md:flex-col gap-2 md:gap-0 text-white/90">
              <Link href="/admin" className="block rounded-xl px-4 py-3 hover:bg-white/10 focus-glow transition-all font-semibold">
                Overview
              </Link>
              <Link href="/admin/titles" className="block rounded-xl px-4 py-3 hover:bg-white/10 focus-glow transition-all font-semibold">
                Titles
              </Link>
              <Link href="/admin/genres" className="block rounded-xl px-4 py-3 hover:bg-white/10 focus-glow transition-all font-semibold">
                Genres
              </Link>
              <Link href="/admin/home-sections" className="block rounded-xl px-4 py-3 hover:bg-white/10 focus-glow transition-all font-semibold">
                Home Sections
              </Link>
              <Link href="/admin/people" className="block rounded-xl px-4 py-3 hover:bg-white/10 focus-glow transition-all font-semibold">
                People
              </Link>
              <Link href="/admin/import" className="block rounded-xl px-4 py-3 hover:bg-white/10 focus-glow transition-all font-semibold">
                Import
              </Link>
              <Link href="/login" className="block rounded-xl px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white text-center font-bold hover:from-red-700 hover:to-pink-700 focus-glow transition-all md:mt-6">
                Login
              </Link>
            </nav>
          </div>
        </aside>
        {/* Floating dashboard panel */}
        <main className="flex-1 flex flex-col gap-8">
          <div className="dashboard-panel glass rounded-2xl p-10 shadow-2xl min-h-[60vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
