import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pick a handle",
  description: "Choose your EVOKE operator handle.",
  robots: { index: false, follow: false },
};

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
