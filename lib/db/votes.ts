// upvote operations. one row per (soul, user). triggers update the
// denormalized count on souls.upvote_count.

import { createClient } from "@/lib/supabase/client";

export async function toggleVote(soulId: string): Promise<{ voted: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { voted: false, error: "not signed in" };

  // check current state
  const { data: existing } = await supabase
    .from("soul_votes")
    .select("soul_id")
    .eq("soul_id", soulId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("soul_votes")
      .delete()
      .eq("soul_id", soulId)
      .eq("user_id", user.id);
    if (error) return { voted: true, error: error.message };
    return { voted: false };
  }

  const { error } = await supabase
    .from("soul_votes")
    .insert({ soul_id: soulId, user_id: user.id });
  if (error) return { voted: false, error: error.message };
  return { voted: true };
}
