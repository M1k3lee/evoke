import { NextResponse } from "next/server";
import { tuneSoulFromFeedback } from "@/lib/groqAssist";
import type { Branch } from "@/lib/types";
import type { SpiceLevel } from "@/lib/intent";

export const runtime = "nodejs";

type Body = {
  feedback: string;
  triggeringReply: string;
  operatorMessage: string;
  mission: string;
  branch: Branch;
  spice: SpiceLevel;
  betrayal: string;
  hardMustKeys: string[];
  customHardMusts: string[];
  shadowPicks: { id: string; kept: string; refused: string }[];
  anchor: { exemplar: string; essence: string };
  dnaSummary: { cadence: string; profanityOk: boolean; lowercase: boolean };
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.feedback?.trim()) {
    return NextResponse.json({ error: "feedback required" }, { status: 400 });
  }
  const result = await tuneSoulFromFeedback(body);
  if (!result) {
    return NextResponse.json(
      { error: "tuner unavailable. revise the BANNED block manually." },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}
