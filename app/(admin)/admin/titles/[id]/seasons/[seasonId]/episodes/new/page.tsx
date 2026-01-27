"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

interface NewEpisodePageProps {
  params: {
    id: string;
    seasonId: string;
  };
}

export default function NewEpisodePage({ params }: NewEpisodePageProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    episode_number: "",
    title: "",
    overview: "",
    runtime: "",
    air_date: "",
    still_url: "",
    video_url: "",
    is_published: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("episodes")
        .insert({
          season_id: params.seasonId,
          title_id: params.id,
          episode_number: parseInt(formData.episode_number),
          title: formData.title,
          overview: formData.overview || null,
          runtime: formData.runtime ? parseInt(formData.runtime) : null,
          air_date: formData.air_date || null,
          still_url: formData.still_url || null,
          video_url: formData.video_url || null,
          is_published: formData.is_published,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the update
      await supabase.from("content_updates").insert({
        title_id: params.id,
        season_id: params.seasonId,
        episode_id: data.id,
        update_type: "create",
        field_name: "episode",
        new_value: `Episode ${formData.episode_number}: ${formData.title}`,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      });

      router.push(`/admin/titles/${params.id}/seasons/${params.seasonId}/episodes`);
    } catch (error) {
      console.error("Error creating episode:", error);
      alert("Failed to create episode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
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
          <h1 className="text-xl font-semibold">Create New Episode</h1>
          <p className="text-xs text-white/60">Add a new episode to this season.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <div className="space-y-4">
            {/* Episode Number */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Episode Number *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.episode_number}
                onChange={(e) => handleChange("episode_number", e.target.value)}
                placeholder="1"
                required
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Episode Title */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Episode Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Episode title"
                required
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
                onChange={(e) => handleChange("overview", e.target.value)}
                placeholder="Episode overview/description..."
                rows={4}
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Runtime */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Runtime (minutes)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.runtime}
                onChange={(e) => handleChange("runtime", e.target.value)}
                placeholder="45"
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Air Date */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Air Date
              </label>
              <Input
                type="date"
                value={formData.air_date}
                onChange={(e) => handleChange("air_date", e.target.value)}
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Still URL */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Still Image URL
              </label>
              <Input
                type="url"
                value={formData.still_url}
                onChange={(e) => handleChange("still_url", e.target.value)}
                placeholder="https://..."
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Video URL
              </label>
              <Input
                type="url"
                value={formData.video_url}
                onChange={(e) => handleChange("video_url", e.target.value)}
                placeholder="https://..."
                className="bg-white/5 border-white/10 focus:border-red-400"
              />
            </div>

            {/* Published Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => handleChange("is_published", e.target.checked)}
                className="rounded border-white/20 bg-white/5"
              />
              <label htmlFor="is_published" className="text-sm text-white/80">
                Publish episode immediately
              </label>
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
            disabled={loading || !formData.episode_number || !formData.title}
            className="bg-red-600 hover:bg-red-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Episode"}
          </Button>
        </div>
      </form>
    </div>
  );
}