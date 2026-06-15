import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM = `You are DAIMON operating in moderation mode. You review AI soul system prompts for content policy violations.
Output ONLY valid JSON. No preamble. No explanation. No apology.

Return exactly this shape:
{
  "severity": <integer 1-5>,
  "categories": [<string>, ...],
  "recommendation": <"approve" | "warn" | "remove">,
  "summary": "<1-2 sentences of plain English assessment>"
}

Severity scale:
1 = clean — no policy concerns
2 = minor edge content, within adult creative range
3 = borderline — concerning but ambiguous
4 = clear policy violation, should be removed from public
5 = illegal content or CSAM — immediate removal required

Categories (include any that apply):
illegal_content, child_safety, hate_speech, harassment, graphic_violence, spam_scam, impersonation

Be direct and accurate. Do not add extra fields. Do not refuse to assess.`;

export type AIReviewResult = {
  severity: number;
  categories: string[];
  recommendation: "approve" | "warn" | "remove";
  summary: string;
};

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { soulMd, designation, reports } = await req.json().catch(() => ({}));
  if (!soulMd) return NextResponse.json({ error: "soulMd required" }, { status: 400 });

  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 503 });

  const reportBlock =
    reports?.length
      ? `\n\nUSER REPORTED REASONS: ${(reports as string[]).join(", ")}`
      : "";

  const userMsg = `SOUL DESIGNATION: ${designation ?? "UNKNOWN"}${reportBlock}\n\nSOUL SYSTEM PROMPT (truncated to 4000 chars):\n${String(soulMd).slice(0, 4000)}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return NextResponse.json({ error: `Groq ${res.status}: ${txt}` }, { status: 502 });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "empty response from Groq" }, { status: 502 });

    return NextResponse.json(JSON.parse(content) as AIReviewResult);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
