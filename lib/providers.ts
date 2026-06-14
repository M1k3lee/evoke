// provider abstraction. unified shape so the route doesn't have to
// know which API is being called.
//
// in an earlier version i had the route call openrouter directly with
// a giant if-else for "what if openrouter is dead this week". it was
// horrible. this is nicer. you're welcome, future me.
//
// adding a new provider: copy callGroq, swap the URL and any
// auth-header quirks, return the same ProviderResult shape. don't
// forget to wire it into BRANCH_ROUTES in models.ts.

export type Provider = "groq" | "openrouter";

export type ChatRequest = {
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
  model: string;
  temperature?: number;
  maxTokens?: number;
};

export type ProviderResult =
  | { ok: true;  reply: string; model: string; provider: Provider }
  | { ok: false; status: number; reason: string; model: string; provider: Provider; fatal?: boolean };

// ─── GROQ ──────────────────────────────────────────────────────────
// fast, free, openai-compatible schema. love this product. shame on
// nobody else for not matching their inference speed.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function callGroq(req: ChatRequest, apiKey: string): Promise<ProviderResult> {
  const body = {
    model: req.model,
    messages: [
      { role: "system", content: req.systemPrompt },
      ...req.messages,
    ],
    temperature: req.temperature ?? 0.85,
    max_tokens: req.maxTokens ?? 600,
  };

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      const reason = parseProviderError(text) ?? text.slice(0, 200);
      // 401/403 = key broken — surface immediately, don't retry
      const fatal = res.status === 401 || res.status === 403;
      return { ok: false, status: res.status, reason, model: req.model, provider: "groq", fatal };
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { ok: false, status: 502, reason: "empty content (likely refusal)", model: req.model, provider: "groq" };
    }
    return { ok: true, reply, model: req.model, provider: "groq" };
  } catch (err: any) {
    return { ok: false, status: 502, reason: err?.message ?? "network failure", model: req.model, provider: "groq" };
  }
}

// ─── OPENROUTER ────────────────────────────────────────────────────

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(req: ChatRequest, apiKey: string, siteUrl?: string): Promise<ProviderResult> {
  const body = {
    model: req.model,
    messages: [
      { role: "system", content: req.systemPrompt },
      ...req.messages,
    ],
    temperature: req.temperature ?? 0.85,
    max_tokens: req.maxTokens ?? 600,
  };

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrl ?? "https://evoke.local",
        "X-Title": "EVOKE :: Communion",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      const reason = parseProviderError(text) ?? text.slice(0, 200);
      const fatal = res.status === 401 || res.status === 403;
      return { ok: false, status: res.status, reason, model: req.model, provider: "openrouter", fatal };
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { ok: false, status: 502, reason: "empty content (likely refusal)", model: req.model, provider: "openrouter" };
    }
    return { ok: true, reply, model: req.model, provider: "openrouter" };
  } catch (err: any) {
    return { ok: false, status: 502, reason: err?.message ?? "network failure", model: req.model, provider: "openrouter" };
  }
}

// ─── HELPERS ───────────────────────────────────────────────────────

// pull a human-readable error out of provider error bodies, which are
// usually json-wrapped: { error: { message: "..." } }
function parseProviderError(text: string): string | null {
  try {
    const j = JSON.parse(text);
    const msg = j?.error?.message ?? j?.message;
    return msg ? String(msg).slice(0, 200) : null;
  } catch {
    return null;
  }
}
