import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import UserMenu from "@/components/ui/user-menu";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RareFinds - Discover Movies & Series",
  description:
    "Browse curated movies and series. Admin-managed metadata with realtime updates.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0f0f0f] text-white font-sans">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-blue-400 hover:text-blue-300 transition-colors"
            >
              RareFinds
            </Link>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies, series..."
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-blue-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-6 text-sm text-white/80">
                <Link href="/titles" className="hover:text-red-500 transition">
                  Movies
                </Link>
                <Link href="/series" className="hover:text-red-500 transition">
                  Series
                </Link>
                <Link href="/watchlist" className="hover:text-red-500 transition">
                  Watchlist
                </Link>
              </nav>

              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/90">
          <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-white/60 flex flex-col gap-4 md:flex-row md:justify-between">
            <div>
              <div className="text-red-500 font-bold text-lg mb-2">RareFinds</div>
              <p>Your ultimate destination for movies and series.</p>
            </div>
            <div className="flex gap-8">
              <div>
                <h3 className="font-semibold mb-2">Browse</h3>
                <ul className="space-y-1">
                  <li><Link href="/titles" className="hover:text-red-400">Movies</Link></li>
                  <li><Link href="/series" className="hover:text-red-400">Series</Link></li>
                  <li><Link href="/watchlist" className="hover:text-red-400">Watchlist</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Support</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="hover:text-red-400">Help</a></li>
                  <li><a href="#" className="hover:text-red-400">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6 text-center text-xs text-white/40">
            <span>© {new Date().getFullYear()} RareFinds. Uses TMDB API. Not endorsed or certified by TMDB.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
