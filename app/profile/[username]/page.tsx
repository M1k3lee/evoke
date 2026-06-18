import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Layers, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  listPublicSoulsByUsername,
  listPublicCollectionsByUserId,
} from "@/lib/db/souls-server";
import { getCurrentUser } from "@/lib/auth";
import { PublicSoulGrid } from "@/components/PublicSoulGrid";
import type { LinguisticDNA } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { username: string };

export default async function ProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, title, sanctioned, signals, created_at")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const [souls, collections, viewer] = await Promise.all([
    listPublicSoulsByUsername(username),
    listPublicCollectionsByUserId(profile.id),
    getCurrentUser(),
  ]);

  const isOwn = viewer?.profile?.username === username;
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  const signals: Array<{ label: string; url: string }> = Array.isArray(profile.signals)
    ? (profile.signals as Array<{ label: string; url: string }>).filter((s) => s.label && s.url)
    : [];

  // derive DNA fingerprint from most recent public soul
  const dna: LinguisticDNA | null =
    souls[0]?.state_json?.dna ?? null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        operator dossier
      </div>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="mt-5 border border-neutral-800 bg-neutral-950/50 p-6 sm:p-8">
        {/* handle + badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-neutral-500">@{profile.username}</span>
          {profile.sanctioned && (
            <span className="border border-acid/50 bg-acid/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
              [SANCTIONED]
            </span>
          )}
        </div>

        {/* display name */}
        <h1 className="mt-2 font-display text-5xl font-extrabold uppercase tracking-tighter md:text-7xl">
          {profile.display_name || profile.username}
          <span className="text-acid">.</span>
        </h1>

        {/* title */}
        {profile.title && (
          <p className="mt-2 font-mono text-sm text-neutral-300">
            {profile.title}
          </p>
        )}

        {/* bio */}
        {profile.bio && (
          <p className="mt-3 max-w-xl font-mono text-sm leading-relaxed text-neutral-500">
            &gt; {profile.bio}
          </p>
        )}

        {/* signals */}
        {signals.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-700">
              // signals
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {signals.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500 transition-colors hover:text-acid"
                >
                  {s.label}
                  <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* stats + actions */}
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-neutral-900 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          <span>{souls.length} soul{souls.length !== 1 ? "s" : ""} forged</span>
          {collections.length > 0 && (
            <>
              <span className="text-neutral-800">·</span>
              <span>{collections.length} collection{collections.length !== 1 ? "s" : ""}</span>
            </>
          )}
          <span className="text-neutral-800">·</span>
          <span>since {joined}</span>
          {isOwn && (
            <Link
              href="/settings"
              className="ml-auto text-acid hover:underline"
            >
              edit profile →
            </Link>
          )}
        </div>
      </div>

      {/* ── DNA FINGERPRINT ────────────────────────────── */}
      {dna && (
        <div className="mt-3 border border-neutral-900 bg-neutral-950/30 px-5 py-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-700">
            // operator dna fingerprint
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-neutral-500">
            <span>cadence: <span className="text-neutral-300">{dna.cadence}</span></span>
            <span className="text-neutral-800">·</span>
            <span>system: <span className="text-neutral-300">{dna.rep}</span></span>
            <span className="text-neutral-800">·</span>
            <span>avg sentence: <span className="text-neutral-300">{dna.avgSentenceLen}w</span></span>
            {dna.emDashHabit && (
              <><span className="text-neutral-800">·</span><span className="text-neutral-400">em-dash heavy</span></>
            )}
            {dna.hasLowercaseBias && (
              <><span className="text-neutral-800">·</span><span className="text-neutral-400">lowercase bias</span></>
            )}
            {dna.hasCapsBias && (
              <><span className="text-neutral-800">·</span><span className="text-neutral-400">caps bias</span></>
            )}
            {dna.profanity && (
              <><span className="text-neutral-800">·</span><span className="text-neutral-400">explicit-leaning</span></>
            )}
          </div>
        </div>
      )}

      {/* ── PUBLIC COLLECTIONS ─────────────────────────── */}
      {collections.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-700">
            // collections
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-1.5 border border-neutral-800 bg-neutral-950/40 p-4"
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-3 w-3 text-neutral-600" />
                  <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-300">
                    {c.name}
                  </span>
                </div>
                {c.description && (
                  <p className="font-mono text-[10px] leading-relaxed text-neutral-600">
                    {c.description}
                  </p>
                )}
                <div className="mt-auto pt-1 font-mono text-[10px] text-neutral-700">
                  {c.soul_count} soul{c.soul_count !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PUBLIC SOULS ───────────────────────────────── */}
      <section className="mt-10">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-700">
          // public souls — {souls.length}
        </div>
        {souls.length > 0 ? (
          <PublicSoulGrid souls={souls} signedIn={!!viewer} />
        ) : (
          <div className="mt-4 border border-neutral-900 bg-neutral-950/40 p-10 text-center">
            <Bookmark className="mx-auto h-7 w-7 text-neutral-800" />
            <div className="mt-3 font-display text-lg font-extrabold uppercase tracking-tighter text-neutral-400">
              nothing public — yet
            </div>
            <p className="mt-2 font-mono text-[11px] text-neutral-600">
              &gt; @{profile.username} keeps their souls private for now.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, bio, title")
    .eq("username", username)
    .maybeSingle();

  const name = data?.display_name || username;
  const desc = data?.title
    ? `${data.title} — souls forged by @${username} in EVOKE.`
    : `Souls forged by @${username} in EVOKE.`;

  return {
    title: `@${username} — ${name}`,
    description: desc,
    alternates: { canonical: `/profile/${username}` },
  };
}
