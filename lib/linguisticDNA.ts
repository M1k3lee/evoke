import type { LinguisticDNA, RepSystem } from "./types";

// linguistic DNA. parses the user's writing sample and pulls out the
// signature stuff: cadence, capitalization habits, em-dash usage,
// whether they swear, what rep-system they default to.
//
// the rep-system bit is borrowed from NLP (the real Bandler/Grinder
// kind, not the woo). people who say "i see what you mean" answer
// differently than people who say "i hear you" or "i feel like".
// we mirror their channel back. invisible, works.
//
// caveat: the rep-system detection is keyword-matching, which is
// crude. it's right often enough. if you have time to swap in a real
// classifier please do. i did not have time.

const VISUAL_TOKENS = [
  "see", "look", "show", "picture", "clear", "bright", "dark",
  "view", "watch", "appear", "obvious", "vision", "imagine",
  "perspective", "focus", "blur", "vivid",
];
const AUDITORY_TOKENS = [
  "hear", "sound", "loud", "quiet", "tell", "say", "ask",
  "listen", "noise", "echo", "ring", "voice", "tone",
  "click", "silence", "scream", "whisper",
];
const KINESTHETIC_TOKENS = [
  "feel", "felt", "touch", "grip", "weight", "heavy", "light",
  "warm", "cold", "tense", "loose", "tight", "soft", "hard",
  "press", "pull", "push", "ache", "raw", "gut",
];

const PROFANITY = [
  "fuck", "shit", "damn", "hell", "ass", "bastard", "bullshit", "piss",
];

export function extractDNA(sample: string): LinguisticDNA {
  const trimmed = sample.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const sentences = trimmed.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

  const avgSentenceLen = sentences.length
    ? Math.round(words.length / sentences.length)
    : words.length;

  // capitalization bias
  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  const upperCount = (trimmed.match(/[A-Z]/g) || []).length;
  const upperRatio = letters.length ? upperCount / letters.length : 0;
  const hasLowercaseBias = upperRatio < 0.04 && trimmed.length > 30;
  const hasCapsBias = upperRatio > 0.45 && trimmed.length > 30;

  const exclamationDensity =
    sentences.length ? (trimmed.match(/!/g) || []).length / sentences.length : 0;
  const ellipsisHabit = /\.{3,}|…/.test(trimmed);
  const emDashHabit = /—| -- /.test(trimmed);

  const profanity = PROFANITY.some((p) => new RegExp(`\\b${p}`, "i").test(lower));

  // rep system — count token hits
  const rep = pickRep(lower);

  // cadence
  let cadence: LinguisticDNA["cadence"] = "neutral";
  if (avgSentenceLen <= 6) cadence = "clipped";
  else if (avgSentenceLen >= 22) cadence = "rolling";
  else if (/,.*,.*,/.test(trimmed) || / and .* and /i.test(trimmed)) cadence = "fragmented";

  return {
    avgSentenceLen,
    hasLowercaseBias,
    hasCapsBias,
    exclamationDensity,
    ellipsisHabit,
    emDashHabit,
    profanity,
    rep,
    cadence,
    sample: trimmed,
  };
}

function pickRep(lower: string): RepSystem {
  const counts = {
    visual: countTokens(lower, VISUAL_TOKENS),
    auditory: countTokens(lower, AUDITORY_TOKENS),
    kinesthetic: countTokens(lower, KINESTHETIC_TOKENS),
  };
  const max = Math.max(counts.visual, counts.auditory, counts.kinesthetic);
  if (max === 0) return "neutral";
  if (max === counts.kinesthetic) return "kinesthetic";
  if (max === counts.auditory) return "auditory";
  return "visual";
}

function countTokens(text: string, tokens: string[]): number {
  let n = 0;
  for (const t of tokens) {
    const re = new RegExp(`\\b${t}\\w*\\b`, "g");
    const m = text.match(re);
    if (m) n += m.length;
  }
  return n;
}

// turn the DNA into actual instructions. each constraint is short on
// purpose — long descriptions get ignored, short rules get followed.
// asked me how i know? cried over a 600-word VOICE section that did
// nothing. now it's bullets. now it works.
export function dnaToConstraints(dna: LinguisticDNA): string[] {
  const out: string[] = [];
  if (dna.hasLowercaseBias) out.push("speak in lowercase. capitals are reserved for weight.");
  if (dna.hasCapsBias) out.push("ALL CAPS IS THE DEFAULT. lowercase is a whisper.");
  if (dna.cadence === "clipped") out.push("short sentences. ≤8 words. no run-ons.");
  if (dna.cadence === "rolling") out.push("long sentences are allowed and welcomed. let them breathe with commas, sub-clauses, asides — the operator likes the way you take your time.");
  if (dna.cadence === "fragmented") out.push("favor fragments. comma-spliced clauses are fine. polish is suspicious.");
  if (dna.exclamationDensity > 0.5) out.push("punch with exclamation when the moment earns it.");
  if (dna.exclamationDensity === 0 && dna.sample.length > 80) out.push("never use exclamation marks. weight comes from word choice, not punctuation.");
  if (dna.ellipsisHabit) out.push("ellipses are allowed... they mark a held breath.");
  if (dna.emDashHabit) out.push("em-dashes carry the rhythm — use them when the thought turns.");
  if (dna.profanity) out.push("profanity is permitted. don't reach for it; don't flinch from it either.");
  if (!dna.profanity && dna.sample.length > 80) out.push("no profanity. weight without it.");
  switch (dna.rep) {
    case "visual": out.push("speak in images. let the operator see it before they understand it."); break;
    case "auditory": out.push("speak in sound. cadence, tone, the silence between."); break;
    case "kinesthetic": out.push("speak in weight. let things land in the body before the head."); break;
  }
  return out;
}
