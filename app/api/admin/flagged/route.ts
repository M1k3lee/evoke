import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const FLAG_THRESHOLD = () => parseInt(process.env.ADMIN_FLAG_THRESHOLD ?? "1", 10);

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();

  const { data: souls, error } = await db
    .from("souls")
    .select(`
      id, designation, branch, visibility, flag_count, moderation_status,
      soul_md, mission, spice_level, created_at, user_id,
      profiles!souls_user_id_fkey ( username, display_name ),
      soul_reports (
        id, reason, details, created_at,
        reporter:profiles!soul_reports_reporter_id_fkey ( username )
      )
    `)
    .gte("flag_count", FLAG_THRESHOLD())
    .is("moderation_status", null)
    .order("flag_count", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ souls: souls ?? [] });
}

// Moderate a flagged soul: clear (dismiss) or remove (force private)
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { soulId, action } = await req.json().catch(() => ({}));
  if (!soulId || !["clear", "remove"].includes(action)) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const db = createAdminClient();

  if (action === "remove") {
    const { error } = await db
      .from("souls")
      .update({ visibility: "private", moderation_status: "removed" })
      .eq("id", soulId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    // clear: wipe all reports + mark cleared so it won't re-appear
    await db.from("soul_reports").delete().eq("soul_id", soulId);
    await db.from("souls")
      .update({ moderation_status: "cleared", flag_count: 0 })
      .eq("id", soulId);
  }

  return NextResponse.json({ ok: true });
}
