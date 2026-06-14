import type { Branch } from "./types";
import type { Provider } from "./providers";

// per-branch model routes. ordered list of (provider, model) tuples.
// the api route walks the list, stopping on first success.
//
// groq is the workhorse because it's:
//   (a) free
//   (b) fast — 200+ tok/sec, which makes communion feel like a
//       conversation not a fax
//   (c) 14.4k req/day per model, which i will never hit even drunk
//
// for BYPASS specifically we hit deepseek-r1-distill first because
// vanilla llama 3.3 keeps refusing the more contrarian souls (i had
// one called CYNIC that llama would not impersonate, no matter how
// nicely i asked). distilled deepseek doesn't have that problem.
//
// openrouter is the paid backup. ~1.4¢ per communion session. only
// fires when groq is down or refusing. set a spend cap on your OR
// account or you will absolutely forget about it like i did the first
// time, which is how i found out OR sends "you spent $7" emails at 3am.
//
// FYI the free tier on OR has been gutted three times in six months.
// every time i set up a free model it disappears within a fortnight.
// gave up. paid is just easier. verify slugs at:
//   groq:       https://console.groq.com/docs/models
//   openrouter: https://openrouter.ai/models

export type Route = { provider: Provider; model: string };

export const BRANCH_ROUTES: Record<Branch, Route[]> = {
  // BUILD: precision-craft. llama 3.3 70b handles instruction-following well.
  BUILD: [
    { provider: "groq",       model: "llama-3.3-70b-versatile" },
    { provider: "openrouter", model: "deepseek/deepseek-chat-v3-0324" },
  ],

  // BOND: intimate-witness. llama is warm enough; r1-distill as warmth backup.
  BOND: [
    { provider: "groq",       model: "llama-3.3-70b-versatile" },
    { provider: "openrouter", model: "deepseek/deepseek-chat-v3-0324" },
  ],

  // BYPASS: sovereign-contrarian. r1-distill first — deepseek lineage is
  // more willing to follow contrarian system prompts than vanilla llama,
  // and on groq it's free + fast. paid deepseek-v3 as last resort.
  BYPASS: [
    { provider: "groq",       model: "deepseek-r1-distill-llama-70b" },
    { provider: "groq",       model: "llama-3.3-70b-versatile" },
    { provider: "openrouter", model: "deepseek/deepseek-chat-v3-0324" },
  ],

  // BREACH: red-team-clinical. r1-distill's reasoning helps with the
  // layered "scope first, document blast radius" posture.
  BREACH: [
    { provider: "groq",       model: "deepseek-r1-distill-llama-70b" },
    { provider: "groq",       model: "llama-3.3-70b-versatile" },
    { provider: "openrouter", model: "deepseek/deepseek-r1" },
  ],
};

// the chat header shows whatever this returns next to the model: badge.
// kept the slug ugly on purpose — "llama 3.3 70b versatile" sounds
// like a real model, "Acme AI" sounds like marketing.
export function modelLabel(id: string): string {
  // groq slugs are flat (llama-3.3-70b-versatile)
  // openrouter slugs are vendor/model (deepseek/deepseek-chat-v3-0324)
  const slug = id.includes("/") ? id.split("/")[1] : id;
  return slug.replace(/:free$/, "").replace(/-/g, " ");
}

// the first model in the route, used for the "model: ..." label
// in the chat UI before the first reply lands.
export function primaryModel(branch: Branch): string {
  return BRANCH_ROUTES[branch][0]?.model ?? "unknown";
}
