import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineStack",
  description:
    "Browse curated movies and series. Admin-managed metadata with realtime updates.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="min-h-screen bg-[--background] text-[--foreground] font-sans">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 bg-black/40 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <a href="/" className="text-xl font-semibold text-[--accent]">
                CineStack
              </a>
              <nav className="flex gap-4 text-sm text-white/80">
                <a href="/titles" className="hover:text-[--accent]">
                  Browse
                </a>
                <a href="/watchlist" className="hover:text-[--accent]">
                  Watchlist
                </a>
                <a href="/admin/login" className="hover:text-[--accent]">
                  Admin
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900">
            {children}
          </main>
          <footer className="border-t border-white/10 bg-black/60">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
              <span>© {new Date().getFullYear()} CineStack</span>
              <span>
                This product uses the TMDB API but is not endorsed or certified
                by TMDB.
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
