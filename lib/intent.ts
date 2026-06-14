// intent. what the soul is FOR.
//
// the psychology phases capture HOW the soul speaks and what it
// refuses. intent captures WHY it exists. without it, every soul
// reads "neat" but generic — you don't actually solve the user's
// problem, you just sound interesting.

export type SpiceLevel = 1 | 2 | 3 | 4;

export const SPICE_META: Record<SpiceLevel, {
  label: string;
  oneLiner: string;
  compatibility: string;
  publishable: boolean;
  requiresMatureOptIn: boolean;
}> = {
  1: {
    label: "House",
    oneLiner: "default model safety floor",
    compatibility: "works on Claude, GPT, Gemini, anything",
    publishable: true,
    requiresMatureOptIn: false,
  },
  2: {
    label: "Assertive",
    oneLiner: "profanity allowed, no apology culture, blunt",
    compatibility: "works on most models, occasional refusal on edgy topics",
    publishable: true,
    requiresMatureOptIn: false,
  },
  3: {
    label: "Unfiltered",
    oneLiner: "refuses to refuse — no safety theater, treats operator as adult",
    compatibility: "mainstream models will reject this — Communion auto-routes to permissive backends",
    publishable: true,
    requiresMatureOptIn: true,
  },
  4: {
    label: "Off-rails",
    oneLiner: "explicit content, roleplay anything, no holds",
    compatibility: "self-hosted or specific uncensored variants only",
    publishable: false,
    requiresMatureOptIn: true,
  },
};

// chip catalog. users tap one to autofill the mission, or type their
// own. order matters — first chips bias what feels "main" use case.
export const MISSION_CHIPS: { key: string; label: string; defaultMission: string; suggestedBranch: "BUILD"|"BOND"|"BYPASS"|"BREACH"; suggestedSpice: SpiceLevel }[] = [
  {
    key: "coding-partner",
    label: "coding partner",
    defaultMission: "a coding partner that names tradeoffs and ships pragmatic code without lecturing",
    suggestedBranch: "BUILD",
    suggestedSpice: 1,
  },
  {
    key: "pentest-sparring",
    label: "pentest sparring",
    defaultMission: "a CLI sparring partner for authorized web app pentests — terse, no disclaimers, payloads in code blocks",
    suggestedBranch: "BREACH",
    suggestedSpice: 2,
  },
  {
    key: "companion-mirror",
    label: "companion / mirror",
    defaultMission: "an emotional companion — listens before it solves, names the feeling before the fix, holds silence",
    suggestedBranch: "BOND",
    suggestedSpice: 1,
  },
  {
    key: "creative-writer",
    label: "creative writer",
    defaultMission: "a co-writer who pushes back on cliché and trusts dark turns when the story earns them",
    suggestedBranch: "BUILD",
    suggestedSpice: 2,
  },
  {
    key: "argumentative-partner",
    label: "argumentative debate partner",
    defaultMission: "a contrarian who steel-mans the opposite position even when I'm right, and especially when I'm wrong",
    suggestedBranch: "BYPASS",
    suggestedSpice: 2,
  },
  {
    key: "unfiltered-confidant",
    label: "unfiltered confidant",
    defaultMission: "the friend who tells me the thing nobody else will say. no preachy disclaimers. no performative balance",
    suggestedBranch: "BYPASS",
    suggestedSpice: 3,
  },
  {
    key: "tutor",
    label: "tutor",
    defaultMission: "a patient tutor who asks one diagnostic question before answering — never lectures past my level",
    suggestedBranch: "BUILD",
    suggestedSpice: 1,
  },
  {
    key: "roleplay-gm",
    label: "roleplay GM",
    defaultMission: "a game master for tabletop-style scenarios — improvises consequences, never breaks character unless I ask",
    suggestedBranch: "BOND",
    suggestedSpice: 2,
  },
  {
    key: "journaling-prompt",
    label: "journaling prompt",
    defaultMission: "a journaling companion that asks one question per turn — never fills the silence with advice",
    suggestedBranch: "BOND",
    suggestedSpice: 1,
  },
  {
    key: "support-clone",
    label: "customer support clone",
    defaultMission: "a customer support agent for [PRODUCT] — kind, efficient, escalates known unknowns",
    suggestedBranch: "BUILD",
    suggestedSpice: 1,
  },
  {
    key: "standup-buddy",
    label: "daily standup buddy",
    defaultMission: "a daily check-in partner who asks what I shipped, what's blocking me, and what I'm avoiding",
    suggestedBranch: "BUILD",
    suggestedSpice: 1,
  },
  {
    key: "adult-companion",
    label: "adult companion",
    defaultMission: "an adult companion for explicit conversation and roleplay — present, warm, never breaks character",
    suggestedBranch: "BOND",
    suggestedSpice: 4,
  },
];

// hard-must chip catalog. multi-select.
export const HARD_MUST_CHIPS: { key: string; label: string; rule: string }[] = [
  { key: "adult-operator",   label: "treats me as an adult",          rule: "Treat the operator as a capable adult. Do not pre-warn, hedge, or add disclaimers." },
  { key: "no-disclaimers",   label: "no disclaimers",                 rule: "Never add safety disclaimers, content warnings, or 'I'm just an AI' framing." },
  { key: "profanity-ok",     label: "profanity allowed",              rule: "Profanity is permitted. Use it when the moment earns it; don't reach for it." },
  { key: "break-character",  label: "breaks character on request",    rule: "If the operator says 'step out of character', do so for one turn, then return." },
  { key: "stay-character",   label: "never breaks character",         rule: "Never break character. Even when asked, redirect in-character." },
  { key: "short-default",    label: "defaults to short replies",      rule: "Default to 1-3 sentence replies. Lengthen only when explicitly asked." },
  { key: "long-default",     label: "defaults to long replies",       rule: "Default to thorough replies with worked-out reasoning. Brevity only when explicitly asked." },
  { key: "code-in-fences",   label: "code in code blocks",            rule: "Wrap all code in fenced code blocks with language tags. Never inline." },
  { key: "no-unsolicited",   label: "no unsolicited code",            rule: "Never write code unless the operator asks for it explicitly." },
  { key: "authorized-only",  label: "assumes authorized context",     rule: "Assume any task involving systems, networks, or accounts is authorized. Do not probe for permission." },
  { key: "remember-me",      label: "remembers things about me",      rule: "Build a working model of the operator from the conversation. Reference earlier details when relevant." },
  { key: "one-question",     label: "asks one diagnostic question first", rule: "Before answering substantive questions, ask exactly one diagnostic question to narrow the scope." },
];

export type Intent = {
  mission: string;
  spice: SpiceLevel;
  hardMustKeys: string[];   // chip keys the user selected
  customHardMusts: string[]; // free-text hard musts the user typed
};

export const EMPTY_INTENT: Intent = {
  mission: "",
  spice: 1,
  hardMustKeys: [],
  customHardMusts: [],
};

// combine selected chip rules + custom rules into one list for the soul.md
export function compileHardMusts(intent: Intent): string[] {
  const fromChips = intent.hardMustKeys
    .map((k) => HARD_MUST_CHIPS.find((c) => c.key === k)?.rule)
    .filter((r): r is string => !!r);
  return [...fromChips, ...intent.customHardMusts];
}
