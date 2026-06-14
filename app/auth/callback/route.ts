import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// /auth/callback?code=... — handles both magic link and OAuth.
// Supabase redirects here after the user clicks the magic link OR
// completes the GitHub OAuth dance. we exchange the code for a session
// cookie, then route the user onward.

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/onboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?err=missing-code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth?err=${encodeURIComponent(error.message)}`);
  }

  // session is now set as a cookie. send the user on.
  // onboard checks for a profile and redirects to /forge if they have one.
  return NextResponse.redirect(`${origin}${next}`);
}
