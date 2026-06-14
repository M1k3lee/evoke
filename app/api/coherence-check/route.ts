import { NextResponse } from "next/server";
import { checkCoherence } from "@/lib/groqAssist";
import type { Branch, LinguisticDNA } from "@/lib/types";
import type { SpiceLevel } from "@/lib/intent";

export const runtime = "nodejs";

type Body = {
  mission?: string;
  branch?: Branch;
  spice?: SpiceLevel;
  ignition?: string;
  dna?: LinguisticDNA;
  shadowPicks?: { kept: string; refused: string }[];
  anchor?: { exemplar: string; essence: string };
  betrayal?: string;
  tasteLabel?: string;
  hardMusts?: string[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  // we accept partial state — coherence check can still run on
  // incomplete builds and report what it sees
  const result = await checkCoherence({
    mission: body.mission ?? "",
    branch: body.branch ?? "BUILD",
    spice: body.spice ?? 1,
    ignition: body.ignition ?? "",
    dna: body.dna ?? {
      avgSentenceLen: 0,
      hasLowercaseBias: false,
      hasCapsBias: false,
      exclamationDensity: 0,
      ellipsisHabit: false,
      emDashHabit: false,
      profanity: false,
      rep: "neutral",
      cadence: "neutral",
      sample: "",
    },
    shadowPicks: body.shadowPicks ?? [],
    anchor: body.anchor ?? { exemplar: "", essence: "" },
    betrayal: body.betrayal ?? "",
    tasteLabel: body.tasteLabel ?? "",
    hardMusts: body.hardMusts ?? [],
  });
  if (!result) {
    return NextResponse.json(
      { error: "coherence check unavailable — proceeding without it is safe." },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}
