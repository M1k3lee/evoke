"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Skull, Zap } from "lucide-react";
import { listLibrary, deleteSoul, type SoulRecord } from "@/lib/storage";
import { LocalSoulCard } from "@/components/LocalSoulCard";

export default function ChamberPage() {
  const [souls, setSouls] = useState<SoulRecord[] | null>(null);

  useEffect(() => { setSouls(listLibrary()); }, []);

  function onDelete(id: string) {
    deleteSoul(id);
    setSouls(listLibrary());
  }

  // server-side render fallback before localStorage is readable
  const count = souls?.length ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        local vault — {souls === null ? "..." : `${count} ${count === 1 ? "construct" : "constructs"} stored`}
      </div>

      <div className="mt-3 flex items-end justify-between gap-6">
        <h1 className="font-display text-5xl font-extrabold uppercase tracking-tighter md:text-7xl">
          The Chamber<span className="text-acid">.</span>
        </h1>
        <Skull className="hidden h-12 w-12 text-neutral-700 md:block" />
      </div>
      <p className="mt-3 max-w-2xl font-mono text-sm text-neutral-500">
        &gt; Your saved souls. Stored on this device — no account, no cloud. Speak to one again, view its soul.md, or bury it.
      </p>

      {souls && souls.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {souls.map((s, i) => (
            <LocalSoulCard key={s.id} soul={s} index={i} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <EmptyState loading={souls === null} />
      )}

      <div className="mt-16 border border-dashed border-neutral-800 p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          <Zap className="h-3 w-3" />
          // black suit / cloud sync
        </div>
        <div className="mt-2 font-mono text-xs text-neutral-500">
          &gt; Public chamber, cross-device sync, soul forking, and a community graveyard ship with accounts.
          For now, everything here lives in this browser only. Clearing site data deletes the vault.
        </div>
      </div>
    </div>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <div className="mt-10 border border-neutral-900 bg-neutral-950/40 p-10 text-center font-mono text-sm text-neutral-500">
        <span className="inline-block h-2 w-2 animate-flicker bg-acid align-middle" />
        <span className="ml-2">scanning vault...</span>
      </div>
    );
  }
  return (
    <div className="mt-10 border border-neutral-900 bg-neutral-950/40 p-12 text-center">
      <div className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-300">
        the vault is empty
      </div>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        &gt; You haven't forged a soul yet, or you cleared site data.
      </p>
      <Link
        href="/forge?fresh=1"
        className="mt-6 inline-flex items-center gap-2 border border-acid bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
      >
        begin the conjuring →
      </Link>
    </div>
  );
}
