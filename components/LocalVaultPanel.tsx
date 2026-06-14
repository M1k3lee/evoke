"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listLibrary, deleteSoul, type SoulRecord } from "@/lib/storage";
import { listMySouls, deleteCloudSoul, type CloudSoul } from "@/lib/db/souls";
import { createClient } from "@/lib/supabase/client";
import { LocalSoulCard } from "./LocalSoulCard";
import { CloudSoulCard } from "./CloudSoulCard";

// "your vault" tab. shows cloud souls if signed in, local-only if not.
// signed-in users with leftover local souls get a one-shot migration offer.

export function LocalVaultPanel() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [cloud, setCloud] = useState<CloudSoul[] | null>(null);
  const [local, setLocal] = useState<SoulRecord[] | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setSignedIn(!!user);
    if (user) {
      setCloud(await listMySouls());
    }
    setLocal(listLibrary());
  }

  async function migrate() {
    if (!local || local.length === 0) return;
    setMigrating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMigrating(false); return; }
    // upload each local soul. RLS guards user_id automatically.
    for (const rec of local) {
      await supabase.from("souls").insert({
        user_id: user.id,
        designation: rec.designation,
        branch: rec.state.branch ?? "BUILD",
        state_json: rec.state,
        soul_md: "", // not stored locally; will be regenerated on next render
        visibility: "private",
      });
    }
    // wipe the local copies — they're in the cloud now
    for (const rec of local) deleteSoul(rec.id);
    setMigrating(false);
    await load();
  }

  if (signedIn === null) {
    return (
      <div className="mt-10 border border-neutral-900 bg-neutral-950/40 p-8 text-center font-mono text-xs text-neutral-500">
        <span className="inline-block h-2 w-2 animate-flicker bg-acid align-middle" />
        <span className="ml-2">scanning vault...</span>
      </div>
    );
  }

  if (!signedIn) {
    const localCount = local?.length ?? 0;
    return (
      <div className="mt-6">
        {localCount > 0 ? (
          <>
            <div className="mb-4 border border-yellow-400/30 bg-yellow-400/5 p-4 font-mono text-[11px] leading-relaxed text-yellow-200">
              <strong className="text-yellow-300">heads up:</strong> these souls live on this device only.
              {" "}
              <Link href="/auth?mode=sync" className="underline hover:text-acid">Sign in</Link>
              {" "}to sync them across devices and (optionally) publish them.
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {local!.map((s, i) => (
                <LocalSoulCard
                  key={s.id}
                  soul={s}
                  index={i}
                  onDelete={(id) => { deleteSoul(id); setLocal(listLibrary()); }}
                />
              ))}
            </div>
          </>
        ) : (
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
        )}
      </div>
    );
  }

  // signed in. show cloud souls, offer migration if local copies exist.
  const localCount = local?.length ?? 0;
  return (
    <div className="mt-6">
      {localCount > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4 border border-acid/40 bg-acid/5 p-4 font-mono text-[12px]">
          <div>
            <strong className="text-acid">{localCount} {localCount === 1 ? "soul" : "souls"} on this device</strong> from before you signed in. Upload them to your account?
          </div>
          <button
            onClick={migrate}
            disabled={migrating}
            className="border border-acid bg-acid px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink hover:shadow-[0_0_20px_-4px_rgba(0,255,102,0.7)] disabled:opacity-50"
          >
            {migrating ? "uploading..." : "upload all"}
          </button>
        </div>
      )}

      {cloud && cloud.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cloud.map((s, i) => (
            <CloudSoulCard
              key={s.id}
              soul={s}
              index={i}
              onDelete={async (id) => { await deleteCloudSoul(id); await load(); }}
              onVisibilityChanged={() => void load()}
            />
          ))}
        </div>
      ) : (
        localCount === 0 && (
          <div className="mt-10 border border-neutral-900 bg-neutral-950/40 p-12 text-center">
            <div className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-300">
              your cloud vault is empty
            </div>
            <p className="mt-2 font-mono text-xs text-neutral-500">
              &gt; Forge a soul. It'll save here automatically.
            </p>
            <Link
              href="/forge?fresh=1"
              className="mt-6 inline-flex items-center gap-2 border border-acid bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
            >
              begin the conjuring →
            </Link>
          </div>
        )
      )}
    </div>
  );
}
