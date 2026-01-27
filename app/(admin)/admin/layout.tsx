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
    <div className="min-h-screen bg-black">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="w-56 rounded-xl border border-white/10 bg-black/30 p-4 text-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/60">
            Admin
          </h2>
          <nav className="space-y-1 text-white/85">
            <Link href="/admin" className="block rounded-md px-2 py-1 hover:bg-white/5">
              Overview
            </Link>
            <Link
              href="/admin/titles"
              className="block rounded-md px-2 py-1 hover:bg-white/5"
            >
              Titles
            </Link>
            <Link
              href="/admin/genres"
              className="block rounded-md px-2 py-1 hover:bg-white/5"
            >
              Genres
            </Link>
            <Link
              href="/admin/home-sections"
              className="block rounded-md px-2 py-1 hover:bg-white/5"
            >
              Home Sections
            </Link>
            <Link
              href="/admin/people"
              className="block rounded-md px-2 py-1 hover:bg-white/5"
            >
              People
            </Link>
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

