import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";
import { Toaster } from "@/components/Toaster";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://evoke.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EVOKE — AI Personality Builder Without the Sliders",
    template: "%s · EVOKE",
  },
  description:
    "EVOKE compiles an AI personality (soul.md system prompt) from a nine-phase psychological interrogation — timed instinct, forced-choice shadow, verbatim boundary capture. Free, browser-based, drop-in for Claude / GPT / Gemini.",
  applicationName: "EVOKE",
  keywords: [
    "AI personality builder",
    "AI system prompt generator",
    "custom GPT personality",
    "Claude system prompt",
    "AI character prompt",
    "soul.md",
    "system prompt template",
    "AI persona",
  ],
  authors: [{ name: "EVOKE" }],
  creator: "EVOKE",
  publisher: "EVOKE",
  openGraph: {
    type: "website",
    title: "EVOKE — AI Personality Builder Without the Sliders",
    description:
      "Most builders ask for adjectives. EVOKE runs a nine-phase psychological interrogation and compiles a soul.md system prompt that actually sounds like you wrote it.",
    siteName: "EVOKE",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EVOKE — AI Personality Builder Without the Sliders",
    description:
      "Nine-phase psychological interrogation → soul.md system prompt. Free, browser-based.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-neutral-200 antialiased selection:bg-acid selection:text-ink">
        <Nav />
        <main className="relative">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
