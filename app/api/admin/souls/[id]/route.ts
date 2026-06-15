import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = createAdminClient();

  const { data: soul, error } = await db
    .from("souls")
    .select(`
      id, designation, branch, visibility, flag_count, moderation_status,
      soul_md, mission, spice_level, upvote_count, created_at, updated_at,
      profiles!souls_user_id_fkey ( username, display_name ),
      soul_reports (
        id, reason, details, created_at,
        reporter:profiles!soul_reports_reporter_id_fkey ( username )
      )
    `)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!soul) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ soul });
}
