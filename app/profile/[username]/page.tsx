import { notFound } from "next/navigation";
import Link from "next/link";
import { Skull, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listPublicSoulsByUsername } from "@/lib/db/souls-server";
import { getCurrentUser } from "@/lib/auth";
import { PublicSoulGrid } from "@/components/PublicSoulGrid";

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
    .select("id, username, display_name, bio, created_at")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const [souls, viewer] = await Promise.all([
    listPublicSoulsByUsername(username),
    getCurrentUser(),
  ]);

  const isOwn = viewer?.profile?.username === username;
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short" });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        operator profile
      </div>

      <div className="mt-3 flex items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[12px] text-neutral-500">@{profile.username}</div>
          <h1 className="mt-1 font-display text-5xl font-extrabold uppercase tracking-tighter md:text-7xl">
            {profile.display_name || profile.username}
            <span className="text-acid">.</span>
          </h1>
        </div>
        <User className="hidden h-12 w-12 text-neutral-700 md:block" />
      </div>

      {profile.bio && (
        <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-neutral-400">
          &gt; {profile.bio}
        </p>
      )}

      <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">
        <span>joined {joined}</span>
        <span>·</span>
        <span>{souls.length} public {souls.length === 1 ? "soul" : "souls"}</span>
        {isOwn && (
          <>
            <span>·</span>
            <Link href="/chamber?tab=vault" className="text-acid hover:underline">
              your vault →
            </Link>
          </>
        )}
      </div>

      <div className="mt-10">
        {souls.length > 0 ? (
          <PublicSoulGrid souls={souls} signedIn={!!viewer} />
        ) : (
          <div className="border border-neutral-900 bg-neutral-950/40 p-12 text-center">
            <Skull className="mx-auto h-8 w-8 text-neutral-700" />
            <div className="mt-3 font-display text-xl font-extrabold uppercase tracking-tighter text-neutral-300">
              no public souls — yet
            </div>
            <p className="mt-2 font-mono text-xs text-neutral-500">
              &gt; @{profile.username} hasn't published anything to the Chamber.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Souls forged by @${username} in EVOKE.`,
    alternates: { canonical: `/profile/${username}` },
  };
}
