
"use client";
import { Suspense } from "react";
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-bold mb-4 text-white">Login</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
