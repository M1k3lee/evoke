import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forge a Soul — The Nine-Phase Interrogation",
  description:
    "Build a custom AI personality in nine psychological phases. Timed instinct, forced-choice shadow, verbatim boundary capture. Outputs a soul.md system prompt for Claude, GPT, or Gemini.",
  openGraph: {
    title: "Forge a Soul — EVOKE",
    description:
      "Nine-phase psychological interrogation that compiles into an AI system prompt in your own voice.",
  },
  alternates: { canonical: "/forge" },
};

export default function ForgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
