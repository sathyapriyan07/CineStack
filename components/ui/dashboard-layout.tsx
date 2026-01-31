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
    <div className="min-h-screen bg-gradient-to-br from-background to-background-dark">
      <div className="mx-auto flex flex-col md:flex-row max-w-7xl gap-8 px-2 md:px-8 py-8">
        {/* Frosted Sidebar */}
        <aside className="w-full md:w-64 frosted rounded-2xl p-4 text-sm mb-6 md:mb-0 shadow-soft flex flex-col gap-6">
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60 hidden md:block">
              Admin Panel
            </h2>
            <nav className="flex flex-row md:flex-col gap-2 md:gap-0 text-white/90">
              <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-white/10 focus-glow transition-all">
                Overview
              </Link>
              <Link href="/admin/titles" className="block rounded-lg px-3 py-2 hover:bg-white/10 focus-glow transition-all">
                Titles
              </Link>
              <Link href="/admin/genres" className="block rounded-lg px-3 py-2 hover:bg-white/10 focus-glow transition-all">
                Genres
              </Link>
              <Link href="/admin/home-sections" className="block rounded-lg px-3 py-2 hover:bg-white/10 focus-glow transition-all">
                Home Sections
              </Link>
              <Link href="/admin/people" className="block rounded-lg px-3 py-2 hover:bg-white/10 focus-glow transition-all">
                People
              </Link>
              <Link href="/admin/import" className="block rounded-lg px-3 py-2 hover:bg-white/10 focus-glow transition-all">
                Import
              </Link>
              <Link href="/login" className="block rounded-lg px-3 py-2 bg-red-600 text-white text-center font-semibold hover:bg-red-700 focus-glow transition-all md:mt-4">
                Login
              </Link>
            </nav>
          </div>
        </aside>
        {/* Floating dashboard panel */}
        <main className="flex-1 flex flex-col gap-8">
          <div className="dashboard-panel glass rounded-2xl p-8 shadow-soft min-h-[60vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
