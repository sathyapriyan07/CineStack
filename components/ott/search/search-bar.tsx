"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Mic } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search for "action"' }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount for better UX
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleVoiceSearch = () => {
    // In a real app, this would trigger voice recognition
    console.log("Voice search activated");
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      {/* Search Input Container */}
      <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
        {/* Search Icon */}
        <div className="absolute left-4 flex items-center justify-center">
          <Search className="h-5 w-5 text-white/60" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-transparent pl-12 pr-12 py-3 text-white placeholder-white/60 outline-none rounded-full text-base"
          style={{ fontSize: '16px' }} // Prevents zoom on iOS
        />

        {/* Right Side Icons */}
        <div className="absolute right-4 flex items-center gap-2">
          {/* Clear button (only show when there's text) */}
          {query && (
            <button
              onClick={clearSearch}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <span className="text-white text-sm font-bold">×</span>
            </button>
          )}

          {/* Voice Search Icon */}
          <button
            onClick={handleVoiceSearch}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
          >
            <Mic className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-pink-500/20 blur-xl -z-10 opacity-0 group-focus-within:opacity-100 transition-opacity" />
    </div>
  );
}