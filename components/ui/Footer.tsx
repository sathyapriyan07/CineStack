export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 h-[56px] flex items-center justify-between px-4 border-t border-white/10 text-xs font-medium">
      <div className="flex flex-col items-start">
        <span className="text-white/80 font-semibold">© Rarefindshq</span>
        <span className="text-gray-400 text-[11px]">Minimal OTT streaming platform</span>
      </div>
      <div className="flex gap-3">
        <button className="text-white/80 hover:text-white transition-all rounded-xl px-3 py-1">Watchlist</button>
        <button className="text-white/80 hover:text-white transition-all rounded-xl px-3 py-1">Browse</button>
        <button className="bg-white text-black rounded-full px-3 py-1 font-semibold shadow hover:bg-gray-200 transition-all">Login</button>
      </div>
    </footer>
  );
}
