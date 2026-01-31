import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

import FloatingNavbar from "@/components/ui/floating-navbar";
import Link from "next/link";
import MobileDock from "@/components/ui/mobile-dock";
import { Inter } from "next/font/google";

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
        {/* Floating Apple-style Navbar */}
        <FloatingNavbar />
        {/* Mobile dock navigation (Apple TV+ style) */}
        {/* Mobile dock navigation (Apple TV+ style) */}
        <div className="md:hidden">
          <MobileDock />
        </div>

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
                  <li><a href="/titles" className="hover:text-red-400">Movies</a></li>
                  <li><a href="/series" className="hover:text-red-400">Series</a></li>
                  <li><a href="/watchlist" className="hover:text-red-400">Watchlist</a></li>
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
