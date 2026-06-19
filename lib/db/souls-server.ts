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
async function getUserInteractions(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  soulIds: string[],
): Promise<{ votedIds: Set<string>; bookmarkedIds: Set<string> }> {
  const [{ data: votes }, { data: marks }] = await Promise.all([
    supabase
      .from("soul_votes")
      .select("soul_id")
      .eq("user_id", userId)
      .in("soul_id", soulIds),
    supabase
      .from("bookmarks")
      .select("soul_id")
      .eq("user_id", userId)
      .in("soul_id", soulIds),
  ]);
  return {
    votedIds: new Set((votes ?? []).map((v: { soul_id: string }) => v.soul_id)),
    bookmarkedIds: new Set((marks ?? []).map((m: { soul_id: string }) => m.soul_id)),
  };
}

export async function listPublicSouls(
  sort: "new" | "top" | "trending" = "new",
  limit = 30,
  branch?: string,
): Promise<CloudSoulWithAuthor[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const query = supabase
    .from("souls")
    .select(`*, author:profiles!souls_user_id_fkey(username, display_name)`)
    .eq("visibility", "public")
    .limit(limit);

  if (branch && ["BUILD", "BOND", "BYPASS", "BREACH"].includes(branch)) {
    query.eq("branch", branch);
  }

  if (sort === "top") {
    query.order("upvote_count", { ascending: false }).order("created_at", { ascending: false });
  } else if (sort === "trending") {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query.gte("created_at", since).order("upvote_count", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  const souls = (data ?? []) as unknown as Array<CloudSoul & { author: { username: string; display_name: string | null } | null }>;

  let votedIds = new Set<string>();
  let bookmarkedIds = new Set<string>();
  if (user && souls.length > 0) {
    ({ votedIds, bookmarkedIds } = await getUserInteractions(supabase, user.id, souls.map((s) => s.id)));
  }

  return souls.map((s) => ({ ...s, voted: votedIds.has(s.id), bookmarked: bookmarkedIds.has(s.id) }));
}

export async function getNetworkStats(): Promise<{
  total: number;
  today: number;
  branches: Record<string, number>;
  topSoul: { designation: string; upvote_count: number } | null;
}> {
  const supabase = await createServerClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: total },
    { count: today },
    { data: branchData },
    { data: topData },
  ] = await Promise.all([
    supabase.from("souls").select("*", { count: "exact", head: true }).eq("visibility", "public"),
    supabase.from("souls").select("*", { count: "exact", head: true }).eq("visibility", "public").gte("created_at", todayStart.toISOString()),
    supabase.from("souls").select("branch").eq("visibility", "public"),
    supabase.from("souls").select("designation, upvote_count").eq("visibility", "public").order("upvote_count", { ascending: false }).limit(1),
  ]);

  const branches: Record<string, number> = { BUILD: 0, BOND: 0, BYPASS: 0, BREACH: 0 };
  for (const s of branchData ?? []) {
    const b = (s as { branch: string }).branch;
    if (b in branches) branches[b]++;
  }

  return {
    total: total ?? 0,
    today: today ?? 0,
    branches,
    topSoul: (topData?.[0] as { designation: string; upvote_count: number } | undefined) ?? null,
  };
}

export async function getRandomPublicSoulId(): Promise<string | null> {
  const supabase = await createServerClient();
  const { count } = await supabase
    .from("souls")
    .select("*", { count: "exact", head: true })
    .eq("visibility", "public");
  if (!count) return null;
  const offset = Math.floor(Math.random() * count);
  const { data } = await supabase
    .from("souls")
    .select("id")
    .eq("visibility", "public")
    .range(offset, offset)
    .limit(1);
  return (data?.[0] as { id: string } | undefined)?.id ?? null;
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
  let bookmarked = false;
  if (user) {
    const [{ data: vote }, { data: mark }] = await Promise.all([
      supabase.from("soul_votes").select("soul_id").eq("user_id", user.id).eq("soul_id", soul.id).maybeSingle(),
      supabase.from("bookmarks").select("soul_id").eq("user_id", user.id).eq("soul_id", soul.id).maybeSingle(),
    ]);
    voted = !!vote;
    bookmarked = !!mark;
  }

  return { ...soul, voted, bookmarked };
}

export async function listPublicSoulsByUsername(
  username: string,
): Promise<CloudSoulWithAuthor[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const souls = (data ?? []) as unknown as Array<CloudSoul & { author: { username: string; display_name: string | null } | null }>;

  let votedIds = new Set<string>();
  let bookmarkedIds = new Set<string>();
  if (user && souls.length > 0) {
    ({ votedIds, bookmarkedIds } = await getUserInteractions(supabase, user.id, souls.map((s) => s.id)));
  }

  return souls.map((s) => ({ ...s, voted: votedIds.has(s.id), bookmarked: bookmarkedIds.has(s.id) }));
}

export async function listBookmarkedSouls(userId: string): Promise<CloudSoulWithAuthor[]> {
  const supabase = await createServerClient();

  const { data: bmarks } = await supabase
    .from("bookmarks")
    .select("soul_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!bmarks?.length) return [];
  const ids = bmarks.map((b: { soul_id: string }) => b.soul_id);

  const { data } = await supabase
    .from("souls")
    .select(`*, author:profiles!souls_user_id_fkey(username, display_name)`)
    .in("id", ids)
    .eq("visibility", "public");

  return (data ?? []).map((s: any) => ({ ...s, voted: false, bookmarked: true })) as CloudSoulWithAuthor[];
}

export async function listPublicCollectionsByUserId(
  userId: string,
): Promise<Array<{ id: string; name: string; description: string | null; soul_count: number }>> {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("collections")
    .select("id, name, description")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (!data?.length) return [];

  const withCounts = await Promise.all(
    data.map(async (c: { id: string; name: string; description: string | null }) => {
      const { count } = await supabase
        .from("collection_souls")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", c.id);
      return { ...c, soul_count: count ?? 0 };
    }),
  );

  return withCounts;
}
