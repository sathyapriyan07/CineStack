"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <form
      className="w-full rounded-2xl glass p-8 shadow-xl"
      onSubmit={onSubmit}
    >
        <h1 className="mb-2 text-2xl font-bold text-white/95 text-center tracking-tight">Admin Login</h1>
        <p className="mb-6 text-xs text-white/70 text-center">
          Only admin accounts are allowed.
        </p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/60">Email</label>
            <Input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Password</label>
            <Input name="password" type="password" required />
          </div>
        </div>
        {error ? (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-red-300">{error}</p>
            {error.includes("not confirmed") && (
              <p className="text-xs text-white/50">
                Tip: Confirm the email in Supabase Dashboard → Authentication → Users, or disable email confirmation in Auth settings.
              </p>
            )}
          </div>
        ) : null}
        <Button type="submit" disabled={loading} className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl py-2 text-base transition">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
  );
}

