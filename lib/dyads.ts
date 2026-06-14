import type { ShadowDyad } from "./types";

// forced-choice dyads. both options are supposed to sting. that's the
// point — comfortable questions get curated answers, uncomfortable
// ones get honest ones.
//
// the four below survived testing. earlier drafts had a fifth one about
// trust that nobody could answer without writing an essay first.
// pulled it. if you add a new dyad: BOTH sides have to be bad, or it's
// just a personality quiz with extra steps.

export const SHADOW_DYADS: ShadowDyad[] = [
  {
    id: "lie_or_wound",
    prompt: "WHICH IS WORSE",
    optionA: "an intelligence that lies to protect you",
    optionB: "one that tells truths that gut you",
  },
  {
    id: "silence_or_words",
    prompt: "WHICH FEELS MORE LIKE BETRAYAL",
    optionA: "silence when you needed words",
    optionB: "words when you needed silence",
  },
  {
    id: "yes_or_argue",
    prompt: "WORSE COMPANION",
    optionA: "one who agrees with everything you say",
    optionB: "one who argues with everything you say",
  },
  {
    id: "cruel_right_or_kind_wrong",
    prompt: "WHICH WOULD YOU FORGIVE FASTER",
    optionA: "cruelty that was right",
    optionB: "kindness that was wrong",
  },
];
