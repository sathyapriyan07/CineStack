"use client";

import { useState } from "react";
import Link from "next/link";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center text-blue-400 text-sm font-semibold hover:bg-blue-500/30 transition-all"
      >
        U
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl z-50">
            <div className="py-2">
              <Link
                href="/login"
                className="block px-4 py-3 text-sm text-white/80 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                onClick={() => setIsOpen(false)}
              >
                User Login
              </Link>
              <Link
                href="/admin-login"
                className="block px-4 py-3 text-sm text-white/80 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}