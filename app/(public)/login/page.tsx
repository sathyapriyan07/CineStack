import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-white/60">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

