import { NextResponse } from "next/server";
import { suggestSoulDetails } from "@/lib/groqAssist";
import type { Branch, LinguisticDNA } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  designation: string;
  mission: string;
  branch: Branch;
  dna: LinguisticDNA;
  shadowPriorities: { kept: string; refused: string }[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { designation, mission, branch, dna, shadowPriorities } = body;
  if (!branch || !dna) {
    return NextResponse.json({ error: "branch and dna required" }, { status: 400 });
  }

  const result = await suggestSoulDetails({
    designation: designation ?? "",
    mission: mission ?? "",
    branch,
    dna,
    shadowPriorities: shadowPriorities ?? [],
  });

  if (!result) {
    return NextResponse.json({ error: "DAIMON unavailable" }, { status: 502 });
  }

  return NextResponse.json(result);
}
