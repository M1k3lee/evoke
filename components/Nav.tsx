import Link from "next/link";
import { Skull, Zap } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { NavAuthCluster } from "./NavAuthCluster";

// rendered as a server component so we can read the session cookie
// without flashing the "signed out" state on every navigation.

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="grid h-7 w-7 place-items-center border border-neutral-700 group-hover:border-acid transition-colors">
            <Zap className="h-3.5 w-3.5 text-acid" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tighter">
            EVOKE<span className="text-acid">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 text-[10px] uppercase tracking-widest sm:gap-1 sm:text-xs">
          <Link href="/forge?fresh=1" className="px-2 py-2 hover:text-acid sm:px-3">
            Summon
          </Link>
          <Link href="/chamber" className="flex items-center gap-1.5 px-2 py-2 hover:text-acid sm:px-3">
            <Skull className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">The Chamber</span>
          </Link>
          <NavAuthCluster
            username={user?.profile?.username ?? null}
            hasSession={!!user}
          />
        </nav>
      </div>
    </header>
  );
}
