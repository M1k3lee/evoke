import Link from "next/link";
import { Skull, Sparkles, Library, Bookmark, Shuffle } from "lucide-react";
import { listPublicSouls, listBookmarkedSouls, getNetworkStats } from "@/lib/db/souls-server";
import { getCurrentUser } from "@/lib/auth";
import { PublicSoulGrid } from "@/components/PublicSoulGrid";
import { LocalVaultPanel } from "@/components/LocalVaultPanel";
import { ChamberRead } from "@/components/ChamberRead";

export const dynamic = "force-dynamic";

const VALID_BRANCHES = ["BUILD", "BOND", "BYPASS", "BREACH"] as const;
type Branch = typeof VALID_BRANCHES[number];

export default async function ChamberPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tab?: string; branch?: string }>;
}) {
  const sp = await searchParams;
  const sort = sp.sort === "top" ? "top" : sp.sort === "trending" ? "trending" : "new";
  const rawTab = sp.tab;
  const rawBranch = sp.branch?.toUpperCase();
  const branch = rawBranch && (VALID_BRANCHES as readonly string[]).includes(rawBranch) ? rawBranch as Branch : undefined;

  const user = await getCurrentUser();
  const tab = rawTab === "vault" ? "vault" : rawTab === "marked" && user ? "marked" : "public";

  const [publicSouls, markedSouls, stats] = await Promise.all([
    tab === "public" ? listPublicSouls(sort, 30, branch) : Promise.resolve([]),
    tab === "marked" && user ? listBookmarkedSouls(user.id) : Promise.resolve([]),
    tab === "public" ? getNetworkStats() : Promise.resolve(null),
  ]);

  const tabBase = (t: string) => `/chamber?tab=${t}`;
  const sortBase = `/chamber?tab=public${branch ? `&branch=${branch}` : ""}`;
  const branchBase = `/chamber?tab=public&sort=${sort}`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        {tab === "public"
          ? `the chamber — ${stats?.total ?? publicSouls.length} public ${(stats?.total ?? publicSouls.length) === 1 ? "soul" : "souls"}`
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

      {/* network stats — only on public tab */}
      {tab === "public" && stats && (
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-neutral-600">
          <span>
            <span className="text-neutral-500">{stats.total}</span> souls indexed
          </span>
          <span>
            <span className="text-neutral-500">{stats.today}</span> forged today
          </span>
          {Object.entries(stats.branches).map(([b, n]) => (
            <span key={b}>
              <span className="text-neutral-500">{n}</span> {b}
            </span>
          ))}
          {stats.topSoul && (
            <span className="text-neutral-700">
              top: <span className="text-neutral-500">{stats.topSoul.designation}</span> ({stats.topSoul.upvote_count}↑)
            </span>
          )}
        </div>
      )}

      {/* tabs */}
      <div className="mt-8 flex items-center gap-1 border-b border-neutral-900">
        <TabLink href={tabBase("public")} active={tab === "public"} icon={<Sparkles className="h-3 w-3" />}>
          public souls
        </TabLink>
        <TabLink href={tabBase("vault")} active={tab === "vault"} icon={<Library className="h-3 w-3" />}>
          your vault
        </TabLink>
        {user && (
          <TabLink href={tabBase("marked")} active={tab === "marked"} icon={<Bookmark className="h-3 w-3" />}>
            // marked
          </TabLink>
        )}
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/api/random-soul"
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 hover:text-acid"
            title="Open a random public soul"
          >
            <Shuffle className="h-3 w-3" />
            random
          </Link>
          {user?.profile && (
            <Link
              href={`/profile/${user.profile.username}`}
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 hover:text-acid"
            >
              @{user.profile.username} →
            </Link>
          )}
        </div>
      </div>

      {tab === "public" && (
        <>
          {/* DAIMON Observatory */}
          <ChamberRead />

          {/* sort + branch filters */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em]">
              <span className="text-neutral-600">sort:</span>
              <Link href={`${sortBase}&sort=new`} className={sort === "new" ? "text-acid" : "text-neutral-500 hover:text-acid"}>
                new
              </Link>
              <span className="text-neutral-800">/</span>
              <Link href={`${sortBase}&sort=top`} className={sort === "top" ? "text-acid" : "text-neutral-500 hover:text-acid"}>
                top
              </Link>
              <span className="text-neutral-800">/</span>
              <Link href={`${sortBase}&sort=trending`} className={sort === "trending" ? "text-acid" : "text-neutral-500 hover:text-acid"}>
                trending
              </Link>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em]">
              <span className="text-neutral-600">branch:</span>
              <Link
                href={branchBase}
                className={!branch ? "text-acid" : "text-neutral-500 hover:text-acid"}
              >
                all
              </Link>
              {VALID_BRANCHES.map((b) => (
                <span key={b} className="flex items-center gap-2">
                  <span className="text-neutral-800">/</span>
                  <Link
                    href={`${branchBase}&branch=${b}`}
                    className={branch === b ? "text-acid" : "text-neutral-500 hover:text-acid"}
                  >
                    {b}
                  </Link>
                </span>
              ))}
            </div>
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
