import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Only set cookies in Server Actions and Route Handlers
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Silently fail in page components where cookies can't be modified
            console.warn("Cookie modification not allowed in this context:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          // Only remove cookies in Server Actions and Route Handlers
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Silently fail in page components where cookies can't be modified
            console.warn("Cookie modification not allowed in this context:", error);
          }
        },
      },
    }
  );
}

export async function getSessionAndProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { session: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", session.user.id)
    .single();

  return { session, profile };
}

