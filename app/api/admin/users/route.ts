import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const exportCsv = url.searchParams.get("export") === "csv";
  const search = url.searchParams.get("q")?.toLowerCase() ?? "";
  const page = parseInt(url.searchParams.get("page") ?? "0", 10);
  const limit = exportCsv ? 10000 : 50;

  const db = createAdminClient();

  // list all users from auth (gives us emails)
  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>();
  const createdMap = new Map<string, string>();
  for (const u of authData?.users ?? []) {
    if (u.email) emailMap.set(u.id, u.email);
    createdMap.set(u.id, u.created_at);
  }

  // profiles
  let query = db.from("profiles").select("id, username, display_name, bio, created_at");
  if (search) query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
  const { data: profiles, error } = await query.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // soul counts
  const { data: soulRows } = await db.from("souls").select("user_id");
  const soulCountMap = new Map<string, number>();
  for (const s of soulRows ?? []) {
    soulCountMap.set(s.user_id, (soulCountMap.get(s.user_id) ?? 0) + 1);
  }

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name ?? null,
    email: emailMap.get(p.id) ?? null,
    soul_count: soulCountMap.get(p.id) ?? 0,
    created_at: p.created_at,
  }));

  if (exportCsv) {
    const rows = [
      ["email", "username", "display_name", "souls", "joined"].join(","),
      ...users.map((u) =>
        [u.email ?? "", u.username, u.display_name ?? "", u.soul_count, u.created_at]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\r\n");

    return new Response(rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="evoke-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const total = users.length;
  const paged = users.slice(page * limit, (page + 1) * limit);
  return NextResponse.json({ users: paged, total });
}
