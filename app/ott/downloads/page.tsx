"use client";

import { useState, useEffect } from "react";
import BottomNavigation from "@/components/ott/bottom-navigation";
import { Download, Play, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient as createSupabaseClient } from "@/lib/supabase/client";

interface DownloadedItem {
  id: string;
  title: string;
  poster_url: string;
  type: "movie" | "series";
  download_date: string;
  size: string;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // For now, show mock downloads
        // In a real app, this would fetch from a downloads/user_downloads table
        const mockDownloads: DownloadedItem[] = [
          {
            id: "1",
            title: "Inception",
            poster_url: "/api/placeholder/200/300",
            type: "movie",
            download_date: "2024-01-15",
            size: "2.1 GB",
          },
          {
            id: "2",
            title: "Stranger Things",
            poster_url: "/api/placeholder/200/300",
            type: "series",
            download_date: "2024-01-10",
            size: "15.8 GB",
          },
        ];
        setDownloads(mockDownloads);
      } catch (error) {
        console.error("Error fetching downloads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const handlePlay = (item: DownloadedItem) => {
    console.log("Playing:", item.title);
    // Navigate to player
  };

  const handleDelete = (itemId: string) => {
    setDownloads(downloads.filter(item => item.id !== itemId));
    // In real app, delete from database
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold">Downloads</h1>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/60">Loading downloads...</div>
          </div>
        ) : downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4">
            <Download className="h-16 w-16 text-white/40 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No downloads yet</h2>
            <p className="text-white/60 text-center">
              Download movies and series to watch offline
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {downloads.map((item) => (
              <div
                key={item.id}
                className="flex bg-gray-900 rounded-lg overflow-hidden"
              >
                {/* Poster */}
                <div className="w-20 h-28 flex-shrink-0">
                  <img
                    src={item.poster_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-white/60 capitalize">{item.type}</p>
                    <p className="text-xs text-white/40">
                      Downloaded {new Date(item.download_date).toLocaleDateString()} • {item.size}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlay(item)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      Play
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-white/60 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="downloads" />
    </div>
  );
}
