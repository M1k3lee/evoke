import { NextResponse } from "next/server";
import { chamberRead } from "@/lib/groqAssist";
import { getNetworkStats } from "@/lib/db/souls-server";

export const runtime = "nodejs";

export async function GET() {
  const stats = await getNetworkStats();
  const result = await chamberRead(stats);
  if (!result) return NextResponse.json({ read: null });
  return NextResponse.json(result);
}
