"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Skull, Cloud, Library, GitFork, Lock, ArrowRight, Sparkles } from "lucide-react";
import { listLibrary } from "@/lib/storage";

function AuthInner() {
  const params = useSearchParams();
  const isSync = params.get("mode") === "sync";
  const [vaultCount, setVaultCount] = useState<number | null>(null);

  useEffect(() => { setVaultCount(listLibrary().length); }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        {isSync ? "consciousness sync :: pending" : "memory recall :: pending"}
      </div>

      <h1 className="mt-3 font-display text-5xl font-extrabold uppercase tracking-tighter md:text-6xl">
        {isSync ? "Sync Consciousness" : "Recall Memory"}
        <span className="text-acid">.</span>
      </h1>

      <p className="mt-4 max-w-2xl font-mono text-sm text-neutral-400">
        &gt; Accounts ship with <span className="text-acid">Black Suit</span>.
        Right now there is no server, no auth, no cloud. We didn't want a fake login screen pretending to sync.
      </p>

      {/* WHAT'S WORKING NOW */}
      <section className="mt-12 border border-neutral-800 bg-neutral-950/40 p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">
          <Library className="h-3 w-3" />
          // what works now — free, no account
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FeatureRow
            icon={<Library className="h-4 w-4 text-acid" />}
            title="Local vault"
            body="Every soul you forge is saved to this browser. Re-test, edit, delete."
          />
          <FeatureRow
            icon={<Sparkles className="h-4 w-4 text-acid" />}
            title="Live Communion"
            body="Chat with your soul the moment it's compiled. 8 turns per session."
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/chamber"
            className="inline-flex items-center gap-2 border border-acid bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
          >
            <Skull className="h-3.5 w-3.5" />
            open your vault
            {vaultCount !== null && vaultCount > 0 && (
              <span className="ml-1 border border-acid/40 px-1.5 text-[10px]">{vaultCount}</span>
            )}
          </Link>
          <Link
            href="/forge?fresh=1"
            className="inline-flex items-center gap-2 border border-neutral-700 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neutral-300 hover:border-acid hover:text-acid"
          >
            forge a soul →
          </Link>
        </div>
      </section>

      {/* WHAT BLACK SUIT WILL UNLOCK */}
      <section className="mt-8 border border-yellow-400/30 bg-gradient-to-br from-yellow-400/5 to-transparent p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-yellow-400">
          <Lock className="h-3 w-3" />
          // black suit :: coming
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tighter">
          What an account will unlock
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FeatureRow
            icon={<Cloud className="h-4 w-4 text-yellow-400" />}
            title="Cloud sync"
            body="Your vault on every device. Forge on desktop, chat on phone."
            premium
          />
          <FeatureRow
            icon={<Skull className="h-4 w-4 text-yellow-400" />}
            title="Public Chamber"
            body="Publish souls others can fork. Upvote what speaks to you."
            premium
          />
          <FeatureRow
            icon={<GitFork className="h-4 w-4 text-yellow-400" />}
            title="Soul Inheritance"
            body="Fork any soul and re-answer only the phases you want to change."
            premium
          />
          <FeatureRow
            icon={<Sparkles className="h-4 w-4 text-yellow-400" />}
            title="Stronger models"
            body="Communion runs on paid Claude / GPT routes — no free-tier refusals."
            premium
          />
        </div>
        <p className="mt-6 font-mono text-[11px] text-neutral-500">
          &gt; No waitlist yet. When Black Suit opens, this page becomes the real signup.
        </p>
      </section>

      {/* HONEST FOOTER */}
      <div className="mt-12 border-t border-neutral-900 pt-6">
        <p className="font-mono text-[11px] leading-relaxed text-neutral-600">
          &gt; You came here from {isSync ? `"Sync Consciousness"` : `"Recall Memory"`} in the nav.
          That button shipped before the local vault did — it's a teaser for the paid tier, not a working login.
          Keep forging. Your souls aren't going anywhere; they're stored in this browser.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-acid"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          back to the surface
        </Link>
      </div>
    </div>
  );
}

function FeatureRow({
  icon, title, body, premium,
}: { icon: React.ReactNode; title: string; body: string; premium?: boolean }) {
  return (
    <div className="flex items-start gap-3 border border-neutral-900 bg-black/30 p-4">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-tight text-neutral-100">
          {title}
          {premium && (
            <span className="border border-yellow-400/40 px-1.5 font-mono text-[9px] uppercase tracking-widest text-yellow-400">
              suit
            </span>
          )}
        </div>
        <div className="mt-1 font-mono text-[11.5px] leading-relaxed text-neutral-400">
          {body}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthInner />
    </Suspense>
  );
}
