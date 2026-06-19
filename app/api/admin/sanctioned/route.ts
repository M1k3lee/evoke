import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { userId, grant } = await req.json();
  if (!userId || typeof grant !== "boolean") {
    return NextResponse.json({ error: "userId and grant required" }, { status: 400 });
  }

  const db = createAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ sanctioned: grant })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
