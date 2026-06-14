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
          <NavAuthCluster
            username={user?.profile?.username ?? null}
            hasSession={!!user}
          />
        </nav>
      </div>
    </header>
  );
}
