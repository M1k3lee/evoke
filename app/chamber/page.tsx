import Link from "next/link";
import { Skull, Sparkles, Library, Bookmark } from "lucide-react";
import { listPublicSouls, listBookmarkedSouls } from "@/lib/db/souls-server";
import { getCurrentUser } from "@/lib/auth";
import { PublicSoulGrid } from "@/components/PublicSoulGrid";
import { LocalVaultPanel } from "@/components/LocalVaultPanel";

export const dynamic = "force-dynamic";

export default async function ChamberPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tab?: string }>;
}) {
  const sp = await searchParams;
  const sort = sp.sort === "top" ? "top" : "new";
  const rawTab = sp.tab;
  const user = await getCurrentUser();
  const tab = rawTab === "vault" ? "vault" : rawTab === "marked" && user ? "marked" : "public";

  const [publicSouls, markedSouls] = await Promise.all([
    tab === "public" ? listPublicSouls(sort, 30) : Promise.resolve([]),
    tab === "marked" && user ? listBookmarkedSouls(user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        {tab === "public"
          ? `the chamber — ${publicSouls.length} public ${publicSouls.length === 1 ? "soul" : "souls"}`
          : tab === "marked"
          ? "the chamber — // marked"
          : "the chamber — your local vault"}
      </div>

      <div className="mt-3 flex items-end justify-between gap-6">
        <h1 className="font-display text-5xl font-extrabold uppercase tracking-tighter md:text-7xl">
          The Chamber<span className="text-acid">.</span>
        </h1>
        <Skull className="hidden h-12 w-12 text-neutral-700 md:block" />
      </div>
      <p className="mt-3 max-w-2xl font-mono text-sm text-neutral-500">
        &gt; Public graveyard of souls forged by the network. Upvote what speaks to you. Fork what you want to twist into your own.
      </p>

      {/* tabs */}
      <div className="mt-10 flex items-center gap-1 border-b border-neutral-900">
        <TabLink href="/chamber?tab=public" active={tab === "public"} icon={<Sparkles className="h-3 w-3" />}>
          public souls
        </TabLink>
        <TabLink href="/chamber?tab=vault" active={tab === "vault"} icon={<Library className="h-3 w-3" />}>
          your vault
        </TabLink>
        {user && (
          <TabLink href="/chamber?tab=marked" active={tab === "marked"} icon={<Bookmark className="h-3 w-3" />}>
            // marked
          </TabLink>
        )}
        {user?.profile && (
          <Link
            href={`/profile/${user.profile.username}`}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 hover:text-acid"
          >
            @{user.profile.username} →
          </Link>
        )}
      </div>

      {tab === "public" && (
        <>
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="text-neutral-600">sort:</span>
            <Link href="/chamber?tab=public&sort=new" className={sort === "new" ? "text-acid" : "text-neutral-500 hover:text-acid"}>
              new
            </Link>
            <span className="text-neutral-800">/</span>
            <Link href="/chamber?tab=public&sort=top" className={sort === "top" ? "text-acid" : "text-neutral-500 hover:text-acid"}>
              top
            </Link>
          </div>
          <PublicSoulGrid souls={publicSouls} signedIn={!!user} />
        </>
      )}

      {tab === "vault" && <LocalVaultPanel />}

      {tab === "marked" && (
        <div className="mt-6">
          {markedSouls.length > 0 ? (
            <PublicSoulGrid souls={markedSouls} signedIn={!!user} />
          ) : (
            <div className="mt-4 border border-neutral-900 bg-neutral-950/40 p-12 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-neutral-800" />
              <div className="mt-3 font-display text-xl font-extrabold uppercase tracking-tighter text-neutral-300">
                nothing marked yet
              </div>
              <p className="mt-2 font-mono text-xs text-neutral-500">
                &gt; Bookmark souls in the public chamber to find them here.
              </p>
              <Link
                href="/chamber?tab=public"
                className="mt-6 inline-flex items-center gap-2 border border-neutral-800 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neutral-400 hover:border-acid hover:text-acid"
              >
                browse the chamber →
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="mt-16 border border-dashed border-neutral-800 p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          // moderation
        </div>
        <div className="mt-2 font-mono text-xs text-neutral-500">
          &gt; See something that crosses a line? Use the report button on the soul. Flagged souls are hidden pending review.
        </div>
      </div>
    </div>
  );
}

function TabLink({
  href, active, icon, children,
}: { href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        "flex items-center gap-2 border-b-2 px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors " +
        (active ? "border-acid text-acid" : "border-transparent text-neutral-400 hover:text-neutral-100")
      }
    >
      {icon}
      {children}
    </Link>
  );
}
