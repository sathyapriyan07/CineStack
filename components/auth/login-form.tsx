"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get("next") ?? "/";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const res =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    router.push(nextUrl);
    router.refresh();
  };

  return (
    <div className="w-full flex justify-center items-center min-h-[60vh]">
      <form
        className="w-[90%] max-w-md bg-gray-900 rounded-2xl p-6 shadow-2xl mx-auto transition-all duration-300"
        onSubmit={onSubmit}
      >
        <h1 className="mb-2 text-2xl font-bold text-white text-center tracking-tight">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mb-6 text-xs text-gray-400 text-center">
          Guests can browse. Sign in to manage watchlist and ratings.
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Email</label>
            <input name="email" type="email" required autoComplete="email"
              className="w-full h-11 bg-black text-white placeholder-gray-500 rounded-full px-4 text-base outline-none focus:ring-2 focus:ring-white/20 focus:bg-gray-800 transition-all shadow-md" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Password</label>
            <input name="password" type="password" required
              className="w-full h-11 bg-black text-white placeholder-gray-500 rounded-full px-4 text-base outline-none focus:ring-2 focus:ring-white/20 focus:bg-gray-800 transition-all shadow-md" />
          </div>
        </div>
        {error ? <p className="mt-3 text-xs text-red-400 text-center">{error}</p> : null}
        <button type="submit" disabled={loading}
          className="mt-6 w-full bg-white text-black font-semibold rounded-full py-3 text-base transition-all shadow hover:bg-gray-200">
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
        <button
          type="button"
          className="mt-4 w-full text-center text-xs text-gray-400 hover:text-white underline underline-offset-2 transition-all"
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        >
          {mode === "signin"
            ? "No account? Create one"
            : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

