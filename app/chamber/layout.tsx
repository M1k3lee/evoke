import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Chamber — Your Local Soul Vault",
  description:
    "Every soul you forge is saved locally. Re-test it in Communion, view its soul.md, or fork it into a new build. No account required.",
  openGraph: {
    title: "The Chamber — EVOKE",
    description: "Your local vault of forged AI personalities. Speak to any of them again, live.",
    url: "https://www.evoke.wtf/chamber",
  },
  alternates: { canonical: "https://www.evoke.wtf/chamber" },
};

export default function ChamberLayout({ children }: { children: React.ReactNode }) {
  return children;
}
