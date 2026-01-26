import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Verify title exists and is published
    const { data: title } = await supabase
      .from("titles")
      .select("id")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (!title) {
      return NextResponse.json({ error: "Title not found" }, { status: 404 });
    }

    // Upsert daily metric (increment views)
    const today = new Date().toISOString().split("T")[0];
    
    // Try using the RPC function first
    const { error: rpcError } = await supabase.rpc("increment_title_view", {
      p_title_id: id,
      p_date: today,
    });

    // If RPC doesn't exist or fails, use upsert directly
    if (rpcError) {
      const { data: existing } = await supabase
        .from("title_metrics_daily")
        .select("views")
        .eq("title_id", id)
        .eq("metric_date", today)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from("title_metrics_daily")
          .update({ views: (existing.views || 0) + 1, updated_at: new Date().toISOString() })
          .eq("title_id", id)
          .eq("metric_date", today);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("title_metrics_daily")
          .insert({ title_id: id, metric_date: today, views: 1 });
        if (insertError) throw insertError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track view" },
      { status: 500 }
    );
  }
}
