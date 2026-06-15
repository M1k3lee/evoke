import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0", 10);
  const filter = url.searchParams.get("filter") ?? "all";
  const search = url.searchParams.get("q") ?? "";
  const limit = 50;

  const db = createAdminClient();

  let query = db
    .from("souls")
    .select(
      `id, designation, branch, visibility, flag_count, moderation_status,
       mission, spice_level, upvote_count, created_at,
       profiles!souls_user_id_fkey ( username )`,
      { count: "exact" }
    );

  if (filter === "public") query = query.eq("visibility", "public");
  else if (filter === "flagged") query = query.gte("flag_count", 1).is("moderation_status", null);
  else if (filter === "removed") query = query.eq("moderation_status", "removed");

  if (search) query = query.ilike("designation", `%${search}%`);

  const { data: souls, error, count } = await query
    .order("created_at", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ souls: souls ?? [], total: count ?? 0 });
}

// Force-remove a soul from the admin souls browser
export async function DELETE(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { soulId } = await req.json().catch(() => ({}));
  if (!soulId) return NextResponse.json({ error: "soulId required" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db
    .from("souls")
    .update({ visibility: "private", moderation_status: "removed" })
    .eq("id", soulId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
