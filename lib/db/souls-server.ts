// server-side soul queries. ONLY import from server components and
// route handlers — never from "use client" files, or turbopack will
// try to bundle next/headers for the browser and the build will scream.
//
// kept separate from souls.ts because that file ALSO gets imported
// by client components for the writes (commitCloudSoul, etc).

import { createClient as createServerClient } from "@/lib/supabase/server";
import type { CloudSoul, CloudSoulWithAuthor } from "./souls";

// list public souls. used by /chamber. SSR'd so social previews work
// and the page lands with content instead of a loading spinner.
export async function listPublicSouls(
  sort: "new" | "top" = "new",
  limit = 30,
): Promise<CloudSoulWithAuthor[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const query = supabase
    .from("souls")
    .select(`
      *,
      author:profiles!souls_user_id_fkey(username, display_name)
    `)
    .eq("visibility", "public")
    .limit(limit);

  if (sort === "top") {
    query.order("upvote_count", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  const souls = (data ?? []) as unknown as Array<CloudSoul & { author: { username: string; display_name: string | null } | null }>;

  // figure out which ones the current user has upvoted
  let votedIds = new Set<string>();
  if (user && souls.length > 0) {
    const { data: votes } = await supabase
      .from("soul_votes")
      .select("soul_id")
      .eq("user_id", user.id)
      .in("soul_id", souls.map((s) => s.id));
    votedIds = new Set((votes ?? []).map((v: { soul_id: string }) => v.soul_id));
  }

  return souls.map((s) => ({ ...s, voted: votedIds.has(s.id) }));
}

export async function getPublicSoulById(id: string): Promise<CloudSoulWithAuthor | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("souls")
    .select(`*, author:profiles!souls_user_id_fkey(username, display_name)`)
    .eq("id", id)
    .eq("visibility", "public")
    .maybeSingle();

  if (!data) return null;
  const soul = data as unknown as CloudSoul & { author: { username: string; display_name: string | null } | null };

  let voted = false;
  if (user) {
    const { data: vote } = await supabase
      .from("soul_votes")
      .select("soul_id")
      .eq("user_id", user.id)
      .eq("soul_id", soul.id)
      .maybeSingle();
    voted = !!vote;
  }

  return { ...soul, voted };
}

export async function listPublicSoulsByUsername(
  username: string,
): Promise<CloudSoulWithAuthor[]> {
  const supabase = await createServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return [];

  const { data } = await supabase
    .from("souls")
    .select(`*, author:profiles!souls_user_id_fkey(username, display_name)`)
    .eq("visibility", "public")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (data ?? []).map((s: any) => ({ ...s, voted: false })) as CloudSoulWithAuthor[];
}
