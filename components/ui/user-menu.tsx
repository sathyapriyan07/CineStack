"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role?: string;
}

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user profile to check role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          role: profile?.role,
        });
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          role: profile?.role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-500/20 backdrop-blur-sm border border-gray-400/30 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center text-sm font-semibold transition-all ${
          user
            ? user.role === "admin"
              ? "bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
              : "bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30"
            : "bg-gray-500/20 border-gray-400/30 text-gray-400 hover:bg-gray-500/30"
        }`}
      >
        {user ? (user.role === "admin" ? "A" : "U") : "?"}
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
              {user ? (
                <>
                  {/* Logged in user */}
                  <div className="px-4 py-2 border-b border-white/10">
                    <div className="text-sm text-white/60">Logged in as</div>
                    <div className="text-sm text-white truncate">{user.email}</div>
                    {user.role === "admin" && (
                      <div className="text-xs text-red-400 mt-1">Administrator</div>
                    )}
                  </div>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-3 text-sm text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    href="/watchlist"
                    className="block px-4 py-3 text-sm text-white/80 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    My Watchlist
                  </Link>

                  <Link
                    href="/ratings"
                    className="block px-4 py-3 text-sm text-white/80 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    My Ratings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-gray-500/20 hover:text-gray-300 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Not logged in */}
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-sm text-white/80 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    User Login
                  </Link>
                  <Link
                    href="/admin-login"
                    className="block px-4 py-3 text-sm text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}