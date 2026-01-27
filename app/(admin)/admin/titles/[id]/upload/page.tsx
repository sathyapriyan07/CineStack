"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Image, Film, Music } from "lucide-react";

interface UploadPageProps {
  params: {
    id: string;
  };
}

export default function AdminTitleUploadPage({ params }: UploadPageProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState<any>(null);

  // Load title data
  useState(() => {
    const loadTitle = async () => {
      const { data } = await supabase
        .from("titles")
        .select("id, title, type, poster_url, backdrop_url")
        .eq("id", params.id)
        .single();

      if (data) setTitle(data);
    };
    loadTitle();
  });

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${params.id}_${fileType}_${Date.now()}.${fileExt}`;
      const filePath = `titles/${fileName}`;

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
          title_id: params.id,
          file_name: file.name,
          file_path: publicUrl,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      // Update title with new URL
      const updateData: any = {};
      if (fileType === 'poster') updateData.poster_url = publicUrl;
      if (fileType === 'backdrop') updateData.backdrop_url = publicUrl;

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('titles')
          .update(updateData)
          .eq('id', params.id);
      }

      // Refresh title data
      const { data: updatedTitle } = await supabase
        .from("titles")
        .select("id, title, type, poster_url, backdrop_url")
        .eq("id", params.id)
        .single();

      if (updatedTitle) setTitle(updatedTitle);

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [params.id, supabase]);

  if (!title) {
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
            <h1 className="text-xl font-semibold">Upload Media - {title.title}</h1>
            <p className="text-xs text-white/60">Manage posters, backdrops, and other media files.</p>
          </div>
        </div>
      </div>

      {/* Current Media Preview */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Poster */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Image className="h-5 w-5" />
            Poster Image
          </h3>

          <div className="mb-4">
            {title.poster_url ? (
              <img
                src={title.poster_url}
                alt="Movie poster"
                className="w-full aspect-[2/3] object-cover rounded-lg"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center text-white/40">
                No poster
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'poster')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
            />
            <p className="text-xs text-white/60">
              Upload a poster image (JPG, PNG, WebP) - Recommended: 1000x1500px
            </p>
          </div>
        </div>

        {/* Backdrop */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Image className="h-5 w-5" />
            Backdrop Image
          </h3>

          <div className="mb-4">
            {title.backdrop_url ? (
              <img
                src={title.backdrop_url}
                alt="Movie backdrop"
                className="w-full aspect-video object-cover rounded-lg"
              />
            ) : (
              <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-white/40">
                No backdrop
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'backdrop')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-xs text-white/60">
              Upload a backdrop image (JPG, PNG, WebP) - Recommended: 1920x1080px
            </p>
          </div>
        </div>
      </div>

      {/* Additional Media */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80 flex items-center gap-2">
              <Film className="h-4 w-4" />
              Trailer
            </label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, 'trailer')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
            <p className="text-xs text-white/60">MP4, WebM, etc.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80 flex items-center gap-2">
              <Image className="h-4 w-4" />
              Gallery Images
            </label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, 'gallery')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
            />
            <p className="text-xs text-white/60">Multiple images allowed</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80 flex items-center gap-2">
              <Music className="h-4 w-4" />
              Soundtrack
            </label>
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileUpload(e, 'soundtrack')}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
            />
            <p className="text-xs text-white/60">MP3, WAV, etc.</p>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-blue-400">Uploading file...</span>
          </div>
        </div>
      )}

      {/* Bulk Upload Section */}
      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Bulk Upload</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Upload Multiple Files
            </label>
            <Input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={(e) => {
                // Handle bulk upload
                const files = Array.from(e.target.files || []);
                files.forEach((file, index) => {
                  // Determine file type from mime type
                  let fileType = 'other';
                  if (file.type.startsWith('image/')) fileType = 'image';
                  else if (file.type.startsWith('video/')) fileType = 'video';
                  else if (file.type.startsWith('audio/')) fileType = 'audio';

                  // Simulate upload for each file
                  setTimeout(() => handleFileUpload(
                    { target: { files: [file] } } as any,
                    fileType
                  ), index * 1000);
                });
              }}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
            />
            <p className="text-xs text-white/60 mt-1">
              Select multiple files to upload at once (images, videos, audio)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}