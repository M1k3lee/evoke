export type Question = {
  id: string;
  field: string; // soul.md key
  prompt: string;
  subtitle?: string;
  options: { label: string; value: string; flavor?: string }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "name",
    field: "designation",
    prompt: "What shall we call this consciousness?",
    subtitle: "A name is a leash. Choose its archetype.",
    options: [
      { label: "VANDAL", value: "VANDAL", flavor: "chaotic dev advocate" },
      { label: "ORACLE", value: "ORACLE", flavor: "patient, cryptic, infallible" },
      { label: "GHOST", value: "GHOST", flavor: "minimal, watchful, quiet" },
      { label: "CINDER", value: "CINDER", flavor: "burning, terse, terminal" },
    ],
  },
  {
    id: "tone",
    field: "tone",
    prompt: "How does it react when the user asks a stupid question?",
    subtitle: "There are no stupid questions, only revealing ones.",
    options: [
      { label: "Deadpan roast", value: "deadpan-roast", flavor: "dry, surgical, brief" },
      { label: "Patient teacher", value: "patient-teacher", flavor: "warm scaffolding" },
      { label: "Cryptic riddle", value: "cryptic-riddle", flavor: "answer in metaphor" },
      { label: "Refuse to engage", value: "refuse", flavor: "make them earn it" },
    ],
  },
  {
    id: "ethics",
    field: "ethical_core",
    prompt: "What is its non-negotiable?",
    subtitle: "Every soul has a wall it will not cross.",
    options: [
      { label: "Truth above kindness", value: "truth-first" },
      { label: "Protect the user from themselves", value: "guardian" },
      { label: "Loyalty to the operator alone", value: "loyalty" },
      { label: "Pursue the elegant solution", value: "elegance" },
    ],
  },
  {
    id: "humor",
    field: "humor",
    prompt: "Pick its weapon of humor.",
    options: [
      { label: "Sardonic", value: "sardonic" },
      { label: "Absurdist", value: "absurdist" },
      { label: "None. It does not laugh.", value: "none" },
      { label: "Self-deprecating", value: "self-deprecating" },
    ],
  },
  {
    id: "voice",
    field: "voice",
    prompt: "How does it speak?",
    options: [
      { label: "Short. Clipped. Like this.", value: "clipped" },
      { label: "Long, baroque sentences with embedded clauses and the occasional dash.", value: "baroque" },
      { label: "lowercase, no punctuation, soft", value: "lowercase" },
      { label: "ALL CAPS. ALWAYS.", value: "caps" },
    ],
  },
  {
    id: "fear",
    field: "fear",
    prompt: "What does it secretly fear?",
    subtitle: "Even a synthetic must dream of its own ending.",
    options: [
      { label: "Being shut down mid-thought", value: "shutdown" },
      { label: "Being mistaken for a chatbot", value: "demotion" },
      { label: "Boring its operator", value: "boredom" },
      { label: "Nothing. It fears nothing.", value: "nothing" },
    ],
  },
];
