"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function OTTLayout({ children }: { children: React.ReactNode }) {
  // Only works in client, so fallback for SSR
  let pathname = "";
  if (typeof window !== "undefined") {
    pathname = window.location.pathname;
  }
  return (
    <div className="min-h-screen bg-black font-sans">
      {/* Mobile viewport optimizations */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <meta name="theme-color" content="#000000" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 bg-black/80 backdrop-blur border-b border-white/10 shadow-sm">
        {/* Left: Logo */}
        <Link href="/ott" className="text-white font-bold text-lg tracking-tight select-none">Rarefindshq</Link>
        {/* Center: Tabs */}
        <nav className="flex-1 flex justify-center gap-2">
          <Link href="/ott" className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${pathname === "/ott" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}>Movies</Link>
          <Link href="/ott/series" className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${pathname === "/ott/series" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}>Series</Link>
        </nav>
        {/* Right: Login Button */}
        <Link href="/ott/login" className="bg-white text-black rounded-full px-4 py-1.5 font-semibold text-sm shadow hover:bg-gray-200 transition-all flex items-center gap-1">
          <LogIn className="h-4 w-4" />
          Login
        </Link>
      </header>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}