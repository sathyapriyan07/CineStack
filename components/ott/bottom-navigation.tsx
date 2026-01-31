"use client";

import { useRouter } from "next/navigation";
import { Home, Search, Zap, Download, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab?: string;
}

export default function BottomNavigation({ activeTab = "home" }: BottomNavigationProps) {
  const router = useRouter();
  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/ott" },
    { id: "search", label: "Search", icon: Search, href: "/ott/search" },
    { id: "shorts", label: "Shorts", icon: Zap, href: "/ott/shorts" },
    { id: "downloads", label: "Downloads", icon: Download, href: "/ott/downloads" },
    { id: "profile", label: "Profile", icon: User, href: "/ott/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              <Icon
                className={`h-6 w-6 mb-1 transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span className={`text-xs font-medium transition-all ${
                isActive ? "opacity-100" : "opacity-70"
              }`}>
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-linear-to-r from-blue-500 to-pink-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}