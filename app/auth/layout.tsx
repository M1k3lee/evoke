import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sync Consciousness — Coming with Black Suit",
  description:
    "Cloud sync, public chamber, soul forking, and stronger models ship with the EVOKE Black Suit tier. For now, everything lives in your local vault.",
  // not a useful page to index until accounts are real
  robots: { index: false, follow: true },
  alternates: { canonical: "/auth" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
