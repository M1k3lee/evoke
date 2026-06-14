# EVOKE

> *EVOKE doesn't build your AI's personality. It finds the one you've been carrying.*

A nine-phase psychological interrogation that compiles into a `soul.md` system prompt for any LLM. The final phase — **Communion** — lets you speak to the freshly forged soul live and revise inline.

---

## Stack

- **Next.js 16** (App Router)
- **React 18**, **TypeScript**, **Tailwind CSS**
- **Framer Motion** for transitions
- **Groq** + **OpenRouter** for the Communion LLM calls

---

## Run locally

```bash
npm install
cp .env.local.example .env.local
# paste your API keys into .env.local
npm run dev
```

Open <http://localhost:3000>.

### Required env vars

| Variable | Required? | Notes |
|---|---|---|
| `GROQ_API_KEY` | Recommended | Free, fast primary provider. Sign up at [console.groq.com/keys](https://console.groq.com/keys). |
| `OPENROUTER_API_KEY` | Recommended | Paid fallback (~1.4¢/session). Sign up at [openrouter.ai/keys](https://openrouter.ai/keys) and set a daily spend cap. |
| `NEXT_PUBLIC_SITE_URL` | Yes for prod | Canonical site URL. Used by sitemap, OG image, and metadata. Default: `https://evoke.ai`. |
| `NEXT_PUBLIC_SUPABASE_URL` | For accounts | Supabase project URL. Without this, accounts and cloud vault are disabled — local-only mode still works. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For accounts | Supabase anon key. Safe to ship to the browser — Row-Level Security guards data. |

Communion needs at least one of `GROQ_API_KEY` or `OPENROUTER_API_KEY`. Both together is best — Groq handles the free fast path, OpenRouter is the paid permissive fallback.

### Supabase setup (for accounts + public Chamber)

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) (free tier)
2. Settings → API → copy the **Project URL** and **anon public key** into `.env.local`
3. SQL Editor → paste `supabase/migrations/0001_init.sql` → Run
4. Authentication → URL Configuration → set **Site URL** to your domain (e.g. `https://evoke-two.vercel.app`)
5. Authentication → Providers:
   - **Email** is on by default (magic link works out of the box)
   - **GitHub** — register an OAuth app at [github.com/settings/developers](https://github.com/settings/developers), set the callback to `https://<your-supabase-id>.supabase.co/auth/v1/callback`, paste client ID and secret into Supabase

---

## Routes

| Path | Purpose |
|---|---|
| `/` | Landing |
| `/forge` | The nine-phase interrogation. Accepts `?fresh=1` to wipe state, `?load=<id>&phase=<phase>` to restore a saved soul. |
| `/chamber` | Local soul vault (localStorage-backed). |
| `/support` | Donation page. |
| `/auth` | Sign in / sign up (magic link + GitHub OAuth). |
| `/auth/onboard` | First-time username picker. |
| `/profile/[username]` | Public profile + that user's public souls. |
| `/api/communion` | Server route. Walks the per-branch provider chain. |

---

## Deploy

### Vercel (recommended for Next.js)

1. Push to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Vercel auto-detects Next.js — no config changes needed.
4. Project Settings → Environment Variables → add the three vars above.
5. Deploy. Visit the assigned URL, walk through the forge, confirm Communion works.

### Verify after first deploy

- **OG image** — paste live URL into [opengraph.dev](https://opengraph.dev/). The EVOKE wordmark card should render.
- **Communion** — forge a soul to Phase 7. If you see `no provider configured`, env vars didn't apply — redeploy.

---

## Architecture notes

### The compiler (`lib/generateSoul.ts`)

Outputs an **imperative** system prompt, not a character sheet. Every section commands the model in second person. Branch-specific rules layer in via `lib/branches.ts` and the few-shot dialogues in `lib/dialogues.ts`.

### Provider abstraction (`lib/providers.ts`)

Unified shape for Groq and OpenRouter calls. The route walks the per-branch model chain in `lib/models.ts` until one returns content or all fail.

### Persistence (`lib/storage.ts`)

`localStorage` only. `evoke:draft` holds the in-progress build, `evoke:library` holds completed souls. Cloud sync is planned for the Black Suit tier.

---

## Support

EVOKE is free. Communion costs about 1.4¢ per session on paid model APIs. If you want to keep the souls speaking: [buymeacoffee.com/evokeai](https://buymeacoffee.com/evokeai).
