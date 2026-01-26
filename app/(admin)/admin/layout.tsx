import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      <aside className="w-56 rounded-xl border border-white/10 bg-black/30 p-4 text-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/60">
          Admin
        </h2>
        <nav className="space-y-1 text-white/85">
          <a href="/admin" className="block rounded-md px-2 py-1 hover:bg-white/5">
            Overview
          </a>
          <a
            href="/admin/titles"
            className="block rounded-md px-2 py-1 hover:bg-white/5"
          >
            Titles
          </a>
          <a
            href="/admin/genres"
            className="block rounded-md px-2 py-1 hover:bg-white/5"
          >
            Genres
          </a>
          <a
            href="/admin/home-sections"
            className="block rounded-md px-2 py-1 hover:bg-white/5"
          >
            Home Sections
          </a>
          <a
            href="/admin/people"
            className="block rounded-md px-2 py-1 hover:bg-white/5"
          >
            People
          </a>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}

