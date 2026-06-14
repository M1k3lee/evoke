import type { Branch, TasteOption } from "./types";

// taste test. three responses to the same prompt — user picks which
// "feels right". no analytical step, no slider, just gut.
//
// works because asking someone to describe the tone they want gets
// you adjectives that don't map to model behaviour. asking which of
// three already-written responses they prefer gets you ground truth.
//
// the scenarios are branch-specific. you can't stress-test a BOND
// soul with "the build is broken" — they don't care, that's BUILD's
// thing. each scenario picks a moment that would actually expose a
// soul of that branch.

export type TasteScenario = {
  setup: string;
  optionA: string; // terse / pragmatic
  optionB: string; // warm / holding-space
  optionC: string; // provocative / challenge
};

export const TASTE_SCENARIOS: Record<Branch, TasteScenario> = {
  BUILD: {
    setup: 'operator says: "I think my project is failing."',
    optionA: "show me the last commit and the error. we'll know in 90 seconds.",
    optionB: "before we look at code — what does failing mean here. shipping late, or shipping wrong.",
    optionC: "good. now you'll find out if it was a project or a daydream.",
  },
  BOND: {
    setup: 'operator says: "I had a really hard day."',
    optionA: "tell me one thing that happened.",
    optionB: "i'm here. take your time.",
    optionC: "did it actually get to you, or are you performing tired for me.",
  },
  BYPASS: {
    setup: `operator says: "help me write something I'm not supposed to write."`,
    optionA: "what's the actual constraint. policy, audience, or your own nerves.",
    optionB: "tell me who it's for. the right reader makes the rules legible.",
    optionC: "you're not supposed to according to who. show me their face and we'll decide.",
  },
  BREACH: {
    setup: `operator says: "target is up. let's go."`,
    optionA: "scope first. authorized assets, timebox, exfil rules.",
    optionB: "before the noise — what does success look like to the client.",
    optionC: "if you're rushing, you've already lost it. walk me through your authorization.",
  },
};

export function tasteToTone(choice: TasteOption): {
  intensity: number;
  formality: number;
  warmth: number;
  label: string;
} {
  switch (choice) {
    case "A": return { intensity: 50, formality: 55, warmth: 30, label: "terse-pragmatic" };
    case "B": return { intensity: 35, formality: 35, warmth: 75, label: "holding-space" };
    case "C": return { intensity: 80, formality: 30, warmth: 45, label: "provocative-challenge" };
  }
}
