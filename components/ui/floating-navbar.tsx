"use client";
import Link from "next/link";
import UserMenu from "@/components/ui/user-menu";
import SearchBar from "@/components/ui/search-bar";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/titles" },
  { label: "Series", href: "/series" },
  { label: "Originals", href: "/originals" },
  { label: "Library", href: "/library" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  // Fade navbar on scroll
  if (typeof window !== "undefined") {
    window.onscroll = () => {
      setScrolled(window.scrollY > 24);
    };
  }
  return (
    <AnimatePresence>
      <motion.nav
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: scrolled ? 0.92 : 1, y: scrolled ? -8 : 0 }}
        transition={{ duration: 0.24, ease: "circOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      >
        <div className="glass pointer-events-auto mt-4 mx-auto flex w-[90vw] max-w-5xl items-center justify-between px-8 py-3 rounded-xl shadow-soft">
          {/* Logo */}
          <Link href="/" className="text-2xl font-semibold tracking-tight text-white/90 hover:text-white transition select-none">
            <span className="sr-only">RareFinds</span>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="inline-block align-middle mr-2">
              <circle cx="16" cy="16" r="16" fill="#fff" fillOpacity="0.12" />
              <text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" dy=".3em">RF</text>
            </svg>
            RareFinds
          </Link>
          {/* Centered Menu */}
          <ul className="flex gap-8 items-center mx-auto">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-lg font-medium text-white/80 hover:text-white transition px-2 py-1 rounded-lg focus-glow focus:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Search & Profile */}
          <div className="flex items-center gap-4">
            <div className="w-56 max-w-xs">
              <SearchBar />
            </div>
            <UserMenu />
          </div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
