import { NextResponse } from "next/server";
import type { Branch, ChatMessage } from "@/lib/types";
import { BRANCH_ROUTES } from "@/lib/models";
import { COMMUNION_TURN_CAP } from "@/lib/types";
import { callGroq, callOpenRouter } from "@/lib/providers";

type Failure = { status: number; reason: string; model: string; provider: string };

// /api/communion
//
// the user's freshly compiled soul.md is the system prompt. their chat
// history is the messages. we walk the branch route chain (see
// lib/models.ts) until something returns content.
//
// runs server-side because the API keys live in env vars. don't move
// any of this into a client component, that way lies the kind of
// security incident that ends up on hackernews.
//
// known footgun: if groq returns a 200 but empty content, that's a
// silent refusal. we treat empty content as a failure and try the
// next model. found this out the hard way debugging "why is the soul
// just sending empty messages".

export const runtime = "nodejs";

type Body = {
  soulMd: string;
  branch: Branch;
  messages: ChatMessage[];
};

export async function POST(req: Request) {
  const groqKey = process.env.GROQ_API_KEY;
  const orKey = process.env.OPENROUTER_API_KEY;
  if (!groqKey && !orKey) {
    return NextResponse.json(
      { error: "no provider configured. set GROQ_API_KEY (free) or OPENROUTER_API_KEY in .env.local and restart." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const { soulMd, branch, messages } = body;
  if (!soulMd || !branch || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "missing soulMd, branch, or messages" }, { status: 400 });
  }

  // turn cap (server-side; client also enforces)
  const operatorTurns = messages.filter((m) => m.role === "operator").length;
  if (operatorTurns > COMMUNION_TURN_CAP) {
    return NextResponse.json(
      { error: `session limit reached (${COMMUNION_TURN_CAP} turns).` },
      { status: 429 }
    );
  }

  // shape messages for the provider call
  const chatMessages = messages.map((m) => ({
    role: m.role === "operator" ? ("user" as const) : ("assistant" as const),
    content: m.text,
  }));

  // walk the route chain
  const routes = BRANCH_ROUTES[branch];
  const attempts: Failure[] = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  for (const route of routes) {
    // skip if this provider's key isn't configured
    if (route.provider === "groq" && !groqKey) continue;
    if (route.provider === "openrouter" && !orKey) continue;

    const result =
      route.provider === "groq"
        ? await callGroq(
            { systemPrompt: soulMd, messages: chatMessages, model: route.model },
            groqKey as string
          )
        : await callOpenRouter(
            { systemPrompt: soulMd, messages: chatMessages, model: route.model },
            orKey as string,
            siteUrl
          );

    if (result.ok) {
      return NextResponse.json({
        reply: result.reply,
        model: result.model,
        provider: result.provider,
      });
    }

    attempts.push({
      status: result.status,
      reason: result.reason,
      model: result.model,
      provider: result.provider,
    });

    // if the provider's key is broken, no point trying more of its models —
    // but other providers' routes might still work, so just continue.
    if (result.fatal) continue;
  }

  // every route failed — surface a clear breakdown
  const report = attempts
    .map((a) => `• ${a.provider}/${a.model}: ${a.status} ${a.reason}`)
    .join("\n");

  return NextResponse.json(
    {
      error:
        "every model in the chain failed or refused. details:\n" +
        report +
        "\n\ntry revising the BANNED block, or retry in a minute. if every line is 401/403, the API keys are wrong.",
    },
    { status: 502 }
  );
}
