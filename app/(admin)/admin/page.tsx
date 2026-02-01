import { getSessionAndProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { profile } = await getSessionAndProfile();

  return (
    <div className="w-full min-h-screen bg-black px-2 py-6">
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight text-center">Admin Dashboard</h1>
      <div className="bg-gray-800 rounded-xl p-4 mb-6 mx-auto max-w-md text-center text-white/80 shadow-md">
        Welcome back, {profile?.display_name ?? "Admin"}.
      </div>
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <button className="bg-gray-700 rounded-xl h-12 text-white font-semibold text-base shadow hover:bg-gray-600 transition-all">Titles</button>
        <button className="bg-gray-700 rounded-xl h-12 text-white font-semibold text-base shadow hover:bg-gray-600 transition-all">Genres</button>
        <button className="bg-gray-700 rounded-xl h-12 text-white font-semibold text-base shadow hover:bg-gray-600 transition-all">Home Sections</button>
        <button className="bg-gray-700 rounded-xl h-12 text-white font-semibold text-base shadow hover:bg-gray-600 transition-all">People</button>
        <button className="bg-gray-700 rounded-xl h-12 text-white font-semibold text-base shadow hover:bg-gray-600 transition-all">Import</button>
      </div>
    </div>
  );
}

