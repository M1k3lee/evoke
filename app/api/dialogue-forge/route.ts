import { NextResponse } from "next/server";
import { forgeDialogues } from "@/lib/groqAssist";
import type { Branch, LinguisticDNA } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  designation: string;
  mission: string;
  branch: Branch;
  dna: LinguisticDNA;
  anchor: { exemplar: string; essence: string; aliveness: string; withheld: string };
  shadowPriorities: { kept: string; refused: string }[];
  utteranceSignature: string;
  betrayal: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { designation, mission, branch, dna, anchor, shadowPriorities, utteranceSignature, betrayal } = body;
  if (!designation || !branch || !dna) {
    return NextResponse.json({ error: "designation, branch, and dna required" }, { status: 400 });
  }

  const result = await forgeDialogues({
    designation,
    mission: mission ?? "",
    branch,
    dna,
    anchor: anchor ?? { exemplar: "", essence: "", aliveness: "", withheld: "" },
    shadowPriorities: shadowPriorities ?? [],
    utteranceSignature: utteranceSignature ?? "",
    betrayal: betrayal ?? "",
  });

  if (!result) {
    return NextResponse.json(
      { error: "DAIMON could not forge dialogues — static fallback will be used." },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
