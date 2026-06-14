import { NextResponse } from "next/server";
import { resolveContradiction } from "@/lib/groqAssist";
import type { Branch } from "@/lib/types";
import type { SpiceLevel } from "@/lib/intent";

export const runtime = "nodejs";

type Body = {
  contradiction: { description: string; fields: string[]; suggested_fix: string };
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
  if (!body.contradiction?.description) {
    return NextResponse.json({ error: "contradiction required" }, { status: 400 });
  }
  const result = await resolveContradiction(body);
  if (!result) {
    return NextResponse.json(
      { error: "resolver unavailable — revise the phase manually." },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}
