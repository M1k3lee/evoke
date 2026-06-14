"use client";
import Link from "next/link";
import { Skull, Zap } from "lucide-react";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="grid h-7 w-7 place-items-center border border-neutral-700 group-hover:border-acid transition-colors">
            <Zap className="h-3.5 w-3.5 text-acid" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tighter">
            EVOKE<span className="text-acid">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-xs uppercase tracking-widest">
          <Link href="/forge?fresh=1" className="px-3 py-2 hover:text-acid">Summon</Link>
          <Link href="/chamber" className="px-3 py-2 hover:text-acid flex items-center gap-1.5">
            <Skull className="h-3.5 w-3.5" /> The Chamber
          </Link>
          <Link
            href="/auth"
            className="ml-2 border border-neutral-700 px-3 py-2 hover:border-acid hover:text-acid"
          >
            Recall Memory
          </Link>
          <Link
            href="/auth?mode=sync"
            className="ml-1 border border-acid bg-acid/10 px-3 py-2 text-acid hover:bg-acid hover:text-ink"
          >
            Sync Consciousness
          </Link>
        </nav>
      </div>
    </header>
  );
}
