import { NextResponse } from "next/server";
import { getRandomPublicSoulId } from "@/lib/db/souls-server";

export const runtime = "nodejs";

export async function GET() {
  const id = await getRandomPublicSoulId();
  if (!id) return NextResponse.json({ error: "no souls" }, { status: 404 });
  return NextResponse.redirect(
    new URL(`/forge?cloud=${id}&phase=communion`, process.env.NEXT_PUBLIC_SITE_URL ?? "https://evoke.wtf")
  );
}
