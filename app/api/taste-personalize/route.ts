import { NextResponse } from "next/server";
import { personalizeTaste } from "@/lib/groqAssist";
import type { Branch, LinguisticDNA } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  mission?: string;
  branch?: Branch;
  dna?: LinguisticDNA;
  anchor?: { exemplar: string; essence: string };
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.mission || !body.branch || !body.dna || !body.anchor) {
    return NextResponse.json({ error: "mission, branch, dna, anchor all required" }, { status: 400 });
  }

  const result = await personalizeTaste({
    mission: body.mission,
    branch: body.branch,
    dna: body.dna,
    anchor: body.anchor,
  });
  if (!result) {
    return NextResponse.json(
      { error: "personalization failed — falling back to default scenario." },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}
