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
        {/* Floating navbar only on desktop/tablet */}
        <div className="hidden md:block">
          <FloatingNavbar />
        </div>
        {/* Bottom nav only on mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <MobileDock />
        </div>
        {/* Main content: full width on mobile, centered on larger screens */}
        <main className="min-h-screen w-full md:max-w-4xl md:mx-auto px-2 sm:px-4 md:px-8 pb-16 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
