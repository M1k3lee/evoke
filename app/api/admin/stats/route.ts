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
  const threshold = FLAG_THRESHOLD();

  const [
    { count: totalUsers },
    { count: totalSouls },
    { count: publicSouls },
    { count: privateSouls },
    { count: flaggedSouls },
    { count: removedSouls },
    { count: totalReports },
  ] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("souls").select("*", { count: "exact", head: true }),
    db.from("souls").select("*", { count: "exact", head: true }).eq("visibility", "public"),
    db.from("souls").select("*", { count: "exact", head: true }).eq("visibility", "private"),
    db.from("souls").select("*", { count: "exact", head: true })
      .gte("flag_count", threshold).is("moderation_status", null),
    db.from("souls").select("*", { count: "exact", head: true })
      .eq("moderation_status", "removed"),
    db.from("soul_reports").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalSouls: totalSouls ?? 0,
    publicSouls: publicSouls ?? 0,
    privateSouls: privateSouls ?? 0,
    flaggedSouls: flaggedSouls ?? 0,
    removedSouls: removedSouls ?? 0,
    totalReports: totalReports ?? 0,
  });
}
