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
        {/* ...existing code... */}
        {/* Main content: compact, safe-area, no giant margins */}
        <main className="min-h-screen w-full max-w-2xl mx-auto px-safe pt-2 pb-4 md:pt-4 md:pb-8 flex flex-col gap-4">
          {children}
        </main>
      </body>
    </html>
  );
}
