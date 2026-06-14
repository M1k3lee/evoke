// soul DB operations. mirrors lib/storage.ts but cloud-backed.
// RLS does the heavy lifting on access control — these functions
// don't filter by user_id explicitly because the policies already do.

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { ForgeState, Branch } from "@/lib/types";

export type CloudSoul = {
  id: string;
  user_id: string;
  designation: string;
  branch: Branch;
  state_json: ForgeState;
  soul_md: string;
  visibility: "private" | "public";
  upvote_count: number;
  created_at: string;
  updated_at: string;
};

export type CloudSoulWithAuthor = CloudSoul & {
  author: { username: string; display_name: string | null } | null;
  voted: boolean; // did the current user upvote this?
};

// ─── browser-side ─────────────────────────────────────────────────

// commit a soul to the user's cloud vault. pass an existing id to
// update in place (used by "re-enter Communion → save again" flow).
export async function commitCloudSoul(
  state: ForgeState,
  soulMd: string,
  opts: { id?: string; visibility?: "private" | "public" } = {},
): Promise<CloudSoul | null> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const payload = {
    user_id: user.id,
    designation: state.designation || "UNNAMED",
    branch: state.branch ?? "BUILD",
    state_json: state,
    soul_md: soulMd,
    visibility: opts.visibility ?? "private",
  };

  if (opts.id) {
    const { data, error } = await supabase
      .from("souls")
      .update(payload)
      .eq("id", opts.id)
      .select()
      .single();
    if (error) return null;
    return data as CloudSoul;
  }

  const { data, error } = await supabase
    .from("souls")
    .insert(payload)
    .select()
    .single();
  if (error) return null;
  return data as CloudSoul;
}

export async function listMySouls(): Promise<CloudSoul[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("souls")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as CloudSoul[];
}

export async function getCloudSoul(id: string): Promise<CloudSoul | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("souls")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data as CloudSoul | null;
}

export async function deleteCloudSoul(id: string): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.from("souls").delete().eq("id", id);
}

export async function setVisibility(
  id: string,
  visibility: "private" | "public",
): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.from("souls").update({ visibility }).eq("id", id);
}

// ─── server-side (public chamber) ─────────────────────────────────

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
