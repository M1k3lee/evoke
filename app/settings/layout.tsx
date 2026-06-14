import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Operator settings — mature content opt-in.",
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
