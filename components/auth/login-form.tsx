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
    <div className="w-full">
      <form
        className="w-full rounded-2xl glass p-8 shadow-xl"
        onSubmit={onSubmit}
      >
        <h1 className="mb-2 text-2xl font-bold text-white/95 text-center tracking-tight">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mb-6 text-xs text-white/70 text-center">
          Guests can browse. Sign in to manage watchlist and ratings.
        </p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/60">Email</label>
            <Input name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Password</label>
            <Input name="password" type="password" required />
          </div>
        </div>
        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
        <Button type="submit" disabled={loading} className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl py-2 text-base transition">
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </Button>
        <button
          type="button"
          className="mt-4 w-full text-center text-xs text-white/70 hover:text-white/90 underline underline-offset-2"
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

