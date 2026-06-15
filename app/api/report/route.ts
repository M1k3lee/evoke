import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const VALID_REASONS = new Set([
  "illegal_content", "child_safety", "hate_speech",
  "harassment", "graphic_violence", "spam_scam", "impersonation", "other",
]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "sign in to report" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { soulId, reason, details } = body as {
    soulId?: string; reason?: string; details?: string;
  };

  if (!soulId || !reason || !VALID_REASONS.has(reason)) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const { error } = await supabase.from("soul_reports").insert({
    soul_id: soulId,
    reporter_id: user.id,
    reason,
    details: details ? String(details).slice(0, 500) : null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "already reported" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
