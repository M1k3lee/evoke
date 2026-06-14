import { NextResponse } from "next/server";
import { synthesizeIntent } from "@/lib/groqAssist";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { mission?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const mission = (body.mission ?? "").trim();
  if (!mission) return NextResponse.json({ error: "mission required" }, { status: 400 });

  const result = await synthesizeIntent(mission);
  if (!result) {
    return NextResponse.json(
      { error: "DAIMON is throttled — retry, or fill the brief manually." },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}
