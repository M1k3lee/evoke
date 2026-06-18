import { createClient } from "@/lib/supabase/client";

export async function toggleBookmark(
  soulId: string,
): Promise<{ ok: boolean; bookmarked: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, bookmarked: false };

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("soul_id", soulId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("soul_id", soulId);
    return { ok: !error, bookmarked: false };
  }

  const { error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, soul_id: soulId });
  return { ok: !error, bookmarked: true };
}

export async function listMyBookmarkedIds(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("soul_id")
    .order("created_at", { ascending: false });
  return (data ?? []).map((b: { soul_id: string }) => b.soul_id);
}
