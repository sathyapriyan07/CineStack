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
        {/* Sticky top header: logo + nav tabs inline, always visible */}
        <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-safe py-2 md:py-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="rounded-full bg-white/10 px-3 py-1 text-lg font-bold tracking-tight">RF</span>
            <span className="font-semibold text-base md:text-lg tracking-tight">RareFinds</span>
          </div>
          {/* Nav tabs inline, add more as needed */}
          <nav className="flex gap-2 md:gap-4 text-sm md:text-base">
            <a href="/" className="px-2 py-1 rounded-lg hover:bg-white/10 transition">Home</a>
            <a href="/search" className="px-2 py-1 rounded-lg hover:bg-white/10 transition">Search</a>
            <a href="/shorts" className="px-2 py-1 rounded-lg hover:bg-white/10 transition">Shorts</a>
            <a href="/downloads" className="px-2 py-1 rounded-lg hover:bg-white/10 transition">Downloads</a>
            <a href="/profile" className="px-2 py-1 rounded-lg hover:bg-white/10 transition">Profile</a>
          </nav>
        </header>
        {/* Main content: compact, safe-area, no giant margins */}
        <main className="min-h-screen w-full max-w-2xl mx-auto px-safe pt-2 pb-4 md:pt-4 md:pb-8 flex flex-col gap-4">
          {children}
        </main>
      </body>
    </html>
  );
}
