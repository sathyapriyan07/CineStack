import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 bg-black/80 backdrop-blur border-b border-white/10 shadow-sm">
      {/* Left: Logo */}
      <span className="text-white font-bold text-lg tracking-tight select-none">Rarefindshq</span>
      {/* Center: Tabs */}
      <nav className="flex-1 flex justify-center gap-2">
        <Link href="#" className="px-3 py-1 rounded-xl text-sm font-medium transition-all text-white/90 hover:bg-white/10">Movies</Link>
        <Link href="#" className="px-3 py-1 rounded-xl text-sm font-medium transition-all text-white/90 hover:bg-white/10">Series</Link>
      </nav>
      {/* Right: Profile Initial Circle */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-base shadow-md border border-gray-800">S</div>
      </div>
    </header>
  );
}
