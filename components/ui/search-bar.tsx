import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="w-full px-2 mt-2 mb-4">
      <div className="relative flex items-center w-full">
        <span className="absolute left-4 flex items-center justify-center">
          <Search className="w-5 h-5 text-white/60" />
        </span>
        <input
          type="text"
          placeholder="Search"
          className="w-full h-11 bg-gray-800 text-white placeholder-white/60 rounded-full pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-white/20 focus:bg-gray-700 transition-all shadow-md"
          style={{ fontFamily: 'Inter, Poppins, sans-serif', fontWeight: 500 }}
        />
      </div>
    </div>
  );
}
