// browser-side soul operations. anything that runs in "use client"
// land imports from here. anything server-side (chamber, profile)
// imports from souls-server.ts instead.
//
// RLS does the access control — these don't filter by user_id
// explicitly because the policies already do.

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { ForgeState, Branch } from "@/lib/types";
import { withCleanSession } from "@/lib/types";

export type CloudSoul = {
  id: string;
  user_id: string;
  designation: string;
  branch: Branch;
  state_json: ForgeState;
  soul_md: string;
  visibility: "private" | "public";
  upvote_count: number;
  fork_count: number;
  forked_from: string | null;
  mission: string | null;
  spice_level: 1 | 2 | 3 | 4;
  created_at: string;
  updated_at: string;
};

export type CloudSoulWithAuthor = CloudSoul & {
  author: { username: string; display_name: string | null } | null;
  voted: boolean;
  bookmarked: boolean;
};

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

  // NEVER persist the conversation. it's private to the live session.
  // stripping here means the published row simply doesn't contain it —
  // no amount of API poking can read another operator's chat.
  const persisted = withCleanSession(state);

  const payload = {
    user_id: user.id,
    designation: persisted.designation || "UNNAMED",
    branch: persisted.branch ?? "BUILD",
    state_json: persisted,
    soul_md: soulMd,
    visibility: opts.visibility ?? "private",
    mission: persisted.intent?.mission?.trim() || null,
    spice_level: (persisted.intent?.spice ?? 1) as 1|2|3|4,
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

export async function incrementForkCount(soulId: string): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.rpc("increment_fork_count", { soul_id: soulId });
}

export async function setVisibility(
  id: string,
  visibility: "private" | "public",
): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.from("souls").update({ visibility }).eq("id", id);
}
