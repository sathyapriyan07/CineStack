"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
// UI imports replaced with basic HTML elements
import { ArrowLeft, FileVideo, Image, Film } from "lucide-react";

interface UploadPageProps {
  params: {
    id: string;
    seasonId: string;
    episodeId: string;
  };
}

export default function AdminEpisodeUploadPage({ params }: UploadPageProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [uploading, setUploading] = useState(false);
  const [episode, setEpisode] = useState<any>(null);

  // Load episode data
  useState(() => {
    const loadEpisode = async () => {
      const { data } = await supabase
        .from("episodes")
        .select(`
          id,
          episode_number,
          title,
          still_url,
          video_url,
          seasons(title_id, season_number, titles(title))
        `)
        .eq("id", params.episodeId)
        .single();

      if (data) setEpisode(data);
    };
    loadEpisode();
  });

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${params.episodeId}_${fileType}_${Date.now()}.${fileExt}`;
      const filePath = `episodes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('media_uploads')
        .insert({
          episode_id: params.episodeId,
          file_name: file.name,
          file_path: publicUrl,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      // Update episode with new URL
      const updateData: any = {};
      if (fileType === 'still') updateData.still_url = publicUrl;
      if (fileType === 'video') updateData.video_url = publicUrl;

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('episodes')
          .update(updateData)
          .eq('id', params.episodeId);
      }

      // Refresh episode data
      const { data: updatedEpisode } = await supabase
        .from("episodes")
        .select(`
          id,
          episode_number,
          title,
          still_url,
          video_url,
          seasons(title_id, season_number, titles(title))
        `)
        .eq("id", params.episodeId)
        .single();

      if (updatedEpisode) setEpisode(updatedEpisode);

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [params.episodeId, supabase]);

  if (!episode) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              Upload Media - Episode {episode.episode_number}
            </h1>
            <p className="text-xs text-white/60">
              {episode.seasons?.titles?.title} - Season {episode.seasons?.season_number}
            </p>
          </div>
        </div>
      </div>

      {/* Current Media */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Episode Still */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Image className="h-5 w-5" />
            Episode Still
          </h3>

          <div className="mb-4">
            {episode.still_url ? (
              <img
                src={episode.still_url}
                alt="Episode still"
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center text-white/40">
                No still image
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'still')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
            />
            <p className="text-xs text-white/60">
              Upload a still image for this episode (JPG, PNG, WebP)
            </p>
          </div>
        </div>

        {/* Episode Video */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            Episode Video
          </h3>

          <div className="mb-4">
            {episode.video_url ? (
              <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Film className="h-12 w-12 mx-auto mb-2 text-white/40" />
                  <p className="text-sm text-white/60">Video uploaded</p>
                  <a
                    href={episode.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    View video
                  </a>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center text-white/40">
                <div className="text-center">
                  <FileVideo className="h-12 w-12 mx-auto mb-2" />
                  No video uploaded
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept="video/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'video')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
            />
            <p className="text-xs text-white/60">
              Upload the episode video file (MP4, WebM, etc.)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-blue-400">Uploading file...</span>
          </div>
        </div>
      )}

      {/* Additional Upload Options */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Trailer</label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'trailer')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Behind the Scenes</label>
            <Input
              type="file"
              accept="video/*,image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'bts')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Subtitles</label>
            <Input
              type="file"
              accept=".srt,.vtt,.sub"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'subtitles')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}