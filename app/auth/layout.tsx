import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In / Sign Up",
  description:
    "Bind your operator to EVOKE. Sync your soul vault across devices, publish to the public Chamber, and upvote what speaks to you.",
  alternates: { canonical: "/auth" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
