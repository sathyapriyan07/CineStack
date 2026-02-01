"use client";

import { useRouter } from "next/navigation";
import { Home, Search, LogIn, List } from "lucide-react";

interface BottomNavigationProps {
  activeTab?: string;
}

export default function BottomNavigation({ activeTab = "home" }: BottomNavigationProps) {
  const router = useRouter();
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 h-[60px] flex items-center justify-between px-4 border-t border-white/10 text-xs font-medium">
      {/* Left: Copyright/Tagline */}
      <div className="flex flex-col items-start">
        <span className="text-white/80 font-semibold">© Rarefindshq</span>
        <span className="text-white/50 text-[10px]">Your OTT destination</span>
      </div>
      {/* Right: Navigation */}
      <div className="flex gap-4">
        <button onClick={() => router.push('/ott/watchlist')} className="text-white/80 hover:text-white transition-all rounded-xl px-2 py-1">
          Watchlist
        </button>
        <button onClick={() => router.push('/ott')} className="text-white/80 hover:text-white transition-all rounded-xl px-2 py-1">
          Browse
        </button>
        <button onClick={() => router.push('/ott/login')} className="bg-white text-black rounded-full px-3 py-1 font-semibold shadow hover:bg-gray-200 transition-all">
          Login
        </button>
      </div>
    </footer>
  );
}