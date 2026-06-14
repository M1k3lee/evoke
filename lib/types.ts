// forge state. one big state object that every phase mutates a slice of.
//
// yes, useReducer would be cleaner. no, i'm not refactoring it. the
// flow is linear, the slice is small, useState carries it fine.
//
// if you add a new phase, the checklist is:
//   1. add it to Phase + PHASE_ORDER below
//   2. add any state slice it owns
//   3. add a setter in forge/page.tsx
//   4. add the renderPhase case
// the typechecker will yell at you if you skip step 1 or 2 which is
// the only reason this has stayed shippable while i added a phase a
// week for two months.

export type Branch = "BUILD" | "BOND" | "BYPASS" | "BREACH";

export type Phase =
  | "designation"
  | "branch"
  | "ignition"
  | "mirror"
  | "shadow"
  | "anchor"
  | "betrayal"
  | "tasteTest"
  | "utterance"
  | "communion"
  | "complete";

export const PHASE_ORDER: Phase[] = [
  "designation",
  "branch",
  "ignition",
  "mirror",
  "shadow",
  "anchor",
  "betrayal",
  "tasteTest",
  "utterance",
  "communion",
  "complete",
];

// dominant representational system, inferred from the mirror prose
export type RepSystem = "visual" | "auditory" | "kinesthetic" | "neutral";

export type LinguisticDNA = {
  avgSentenceLen: number;
  hasLowercaseBias: boolean;
  hasCapsBias: boolean;
  exclamationDensity: number;
  ellipsisHabit: boolean;
  emDashHabit: boolean;
  profanity: boolean;
  rep: RepSystem;
  cadence: "clipped" | "rolling" | "fragmented" | "neutral";
  sample: string; // verbatim, for echoing in soul.md
};

export type ShadowDyad = {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
};

export type DyadChoice = "A" | "B";

export type TasteOption = "A" | "B" | "C";

export type UtteranceTuning = {
  intensity: number; // 0..100
  formality: number; // 0..100
  warmth: number;    // 0..100
};

export type ChatRole = "operator" | "soul";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
};

export type CommunionState = {
  messages: ChatMessage[];
  pending: boolean;
  error: string | null;
};

export type ForgeState = {
  phase: Phase;
  designation: string;
  branch: Branch | null;
  ignition: string;                // phase 0 — captured opening sentence
  mirror: string;                  // phase 1 — prose sample
  dna: LinguisticDNA | null;       // derived from mirror
  shadow: Record<string, DyadChoice>; // phase 2
  anchor: { exemplar: string; essence: string }; // phase 3
  betrayal: string;                // phase 4 — verbatim banned behavior
  tasteTest: TasteOption | null;   // phase 5
  utterance: UtteranceTuning;      // phase 6
  communion: CommunionState;       // phase 7 — live chat with the freshly compiled soul
};

export const INITIAL_STATE: ForgeState = {
  phase: "designation",
  designation: "",
  branch: null,
  ignition: "",
  mirror: "",
  dna: null,
  shadow: {},
  anchor: { exemplar: "", essence: "" },
  betrayal: "",
  tasteTest: null,
  utterance: { intensity: 55, formality: 35, warmth: 40 },
  communion: { messages: [], pending: false, error: null },
};

// session-turn cap for free communion. revisit when accounts ship.
export const COMMUNION_TURN_CAP = 8;
