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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <form
        className="w-full max-w-sm rounded-xl border border-white/10 bg-black/30 p-6 shadow-lg"
        onSubmit={onSubmit}
      >
        <h1 className="mb-1 text-xl font-semibold text-white/90">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mb-4 text-xs text-white/60">
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
        <Button type="submit" disabled={loading} className="mt-5 w-full">
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </Button>
        <button
          type="button"
          className="mt-3 w-full text-center text-xs text-white/60 hover:text-white/80"
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

