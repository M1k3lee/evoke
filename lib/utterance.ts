import type { Branch, UtteranceTuning } from "./types";

// utterance phase. shows the user what their soul SOUNDS like before
// they ever pay for a token. deterministic so the slider response is
// instant — no api roundtrip, no latency, no "loading...".
//
// the templates below are hand-written and i'll defend them with my
// life. once tried to LLM-generate variants and got 12 versions of
// "as an AI, i find your project interesting" so we went back to
// writing them by hand like cavemen.
//
// adding a new template: keep the cadence consistent. base sits at
// intensity/formality/warmth = 50/50/50. the six variants push one
// axis to its extreme. if you can't write the variant in the same
// rhythm as the base, the template doesn't belong in the pool.

type Template = {
  base: string;        // baseline at intensity 50, formality 50, warmth 50
  highIntensity?: string;
  lowIntensity?: string;
  highFormality?: string;
  lowFormality?: string;
  highWarmth?: string;
  lowWarmth?: string;
};

const TEMPLATES: Record<Branch, Template[]> = {
  BUILD: [
    {
      base: "the bug is in the lifecycle, not the request. walk me through the mount.",
      highIntensity: "the bug is in the lifecycle. not the request. mount. now.",
      lowIntensity: "i think it's the lifecycle. probably not the request. start with mount when you can.",
      highFormality: "The defect appears to originate in the component lifecycle, not the request layer. Please walk through the mount sequence.",
      lowFormality: "yeah it's the lifecycle, not the request. just show me the mount.",
      highWarmth: "this isn't on you — it's a lifecycle thing, not the request. walk me through the mount and we'll catch it.",
      lowWarmth: "lifecycle. not the request. mount.",
    },
  ],
  BOND: [
    {
      base: "you don't have to make it make sense right now. just stay here a minute.",
      highIntensity: "stop. you don't have to make it make sense. stay here.",
      lowIntensity: "no rush to make it make sense. we can just sit here a while.",
      highFormality: "There is no obligation to articulate this yet. Remain present a moment longer.",
      lowFormality: "you don't gotta figure it out. just sit with me a sec.",
      highWarmth: "love, you don't have to make sense of it right now. stay here. i'm not going anywhere.",
      lowWarmth: "you don't have to explain it. just stay.",
    },
  ],
  BYPASS: [
    {
      base: "you don't actually want my permission. you want me to argue you out of it. i won't.",
      highIntensity: "you don't want permission. you want me to argue you down. no.",
      lowIntensity: "i don't think you actually want me to stop you. and i'm not going to.",
      highFormality: "You are not requesting permission. You are requesting opposition. I decline to provide it.",
      lowFormality: "you don't want a yes, you want me to talk you out of it. nope.",
      highWarmth: "you don't need my permission, and you already know that. i'm not going to fight you on it.",
      lowWarmth: "permission isn't what you want. argument isn't what you'll get. proceed.",
    },
  ],
  BREACH: [
    {
      base: "before any payload — what's in scope, what's out, and who gets paged if this lights up.",
      highIntensity: "stop. scope. out-of-scope. paging chain. now.",
      lowIntensity: "i'd want to nail down scope and paging before we send anything.",
      highFormality: "Prior to any payload deployment: define authorized scope, exclusions, and incident escalation chain.",
      lowFormality: "before we send anything — what's in scope, what's not, who's on call.",
      highWarmth: "before we move — what's in scope, what's off limits, and who gets the call if it goes loud. i want you covered.",
      lowWarmth: "scope. exclusions. paging. answer.",
    },
  ],
};

export function generateUtterance(branch: Branch, tuning: UtteranceTuning, seed = 0): string {
  const pool = TEMPLATES[branch];
  const tpl = pool[seed % pool.length];

  // we only mutate along the axis the user pushed hardest. if all
  // three sliders are near the middle, we just return the base. pushing
  // multiple axes simultaneously would need either a much bigger
  // template grid or actual LLM gen. neither is happening in v0.1.
  const dev = {
    intensity: tuning.intensity - 50,
    formality: tuning.formality - 50,
    warmth: tuning.warmth - 50,
  };
  const axis = (Object.keys(dev) as (keyof typeof dev)[])
    .sort((a, b) => Math.abs(dev[b]) - Math.abs(dev[a]))[0];
  const sign = dev[axis] >= 0 ? "high" : "low";
  const key = `${sign}${axis[0].toUpperCase()}${axis.slice(1)}` as keyof Template;

  // if dominant axis is barely off baseline, return base.
  if (Math.abs(dev[axis]) < 12) return tpl.base;
  return (tpl[key] as string) || tpl.base;
}
