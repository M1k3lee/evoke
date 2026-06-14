import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed the Furnace — Support EVOKE",
  description:
    "EVOKE is free and funded by donations. A $5 coffee covers ~350 Communion sessions. No salaries, no ads, no surveillance product.",
  openGraph: {
    title: "Feed the Furnace — EVOKE",
    description: "Coffee keeps the souls speaking. ~1.4¢ per Communion session.",
  },
  alternates: { canonical: "/support" },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
