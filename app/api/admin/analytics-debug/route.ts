import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const personalKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const apiHost = process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";

  if (!personalKey) {
    return NextResponse.json({ error: "POSTHOG_PERSONAL_API_KEY is not set" });
  }

  try {
    const res = await fetch(`${apiHost}/api/projects/`, {
      headers: { Authorization: `Bearer ${personalKey}` },
    });
    const text = await res.text();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      apiHost,
      keyPrefix: personalKey.slice(0, 10) + "...",
      body: text.slice(0, 500),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "fetch failed" });
  }
}
