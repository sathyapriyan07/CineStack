"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
// UI imports replaced with basic HTML elements
import { ArrowLeft, Save } from "lucide-react";

interface NewSeasonPageProps {
  params: {
    id: string;
  };
}

export default function NewSeasonPage({ params }: NewSeasonPageProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    season_number: "",
    title: "",
    overview: "",
    poster_url: "",
    release_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("seasons")
        .insert({
          title_id: params.id,
          season_number: parseInt(formData.season_number),
          title: formData.title || null,
          overview: formData.overview || null,
          poster_url: formData.poster_url || null,
          release_date: formData.release_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the update
      await supabase.from("content_updates").insert({
        title_id: params.id,
        season_id: data.id,
        update_type: "create",
        field_name: "season",
        new_value: `Season ${formData.season_number}`,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      });

      router.push(`/admin/titles/${params.id}/seasons`);
    } catch (error) {
      console.error("Error creating season:", error);
      alert("Failed to create season. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Create New Season</h1>
          <p className="text-xs text-white/60">Add a new season to this series.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <div className="space-y-4">
            {/* Season Number */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Season Number *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.season_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("season_number", e.target.value)}
                placeholder="1"
                required
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Season Title */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Season Title
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("title", e.target.value)}
                placeholder="Season title (optional)"
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Overview */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Overview
              </label>
              <Textarea
                value={formData.overview}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("overview", e.target.value)}
                placeholder="Season overview/description..."
                rows={4}
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Poster URL */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Poster URL
              </label>
              <Input
                type="url"
                value={formData.poster_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("poster_url", e.target.value)}
                placeholder="https://..."
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Release Date
              </label>
              <Input
                type="date"
                value={formData.release_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("release_date", e.target.value)}
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.season_number}
            className="bg-red-600 hover:bg-red-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Season"}
          </Button>
        </div>
      </form>
    </div>
  );
}