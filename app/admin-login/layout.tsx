import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-black via-zinc-900/80 to-black">
      <div className="glass rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}