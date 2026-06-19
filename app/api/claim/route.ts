import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "valid email required" }, { status: 400 });
  }

  // check current profile state
  const { data: profile } = await supabase
    .from("profiles")
    .select("sanctioned, sanctioned_claimed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.sanctioned) {
    return NextResponse.json({ ok: true, already: true });
  }

  // rate-limit: one claim per 24h
  if (profile?.sanctioned_claimed_at) {
    const claimedAt = new Date(profile.sanctioned_claimed_at).getTime();
    if (Date.now() - claimedAt < 1000 * 60 * 60 * 24) {
      return NextResponse.json({ error: "claim already submitted — an admin will review it shortly" }, { status: 429 });
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      sanctioned_bmac_email: email.trim().toLowerCase(),
      sanctioned_claimed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
