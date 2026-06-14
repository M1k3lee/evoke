"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";

// the right side of the nav. server side passes us session state.
// signed out → recall / sync buttons.
// signed in  → handle + dropdown with profile + sign out.

export function NavAuthCluster({
  username,
  hasSession,
}: {
  username: string | null;
  hasSession: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!hasSession) {
    return (
      <>
        {/* Recall Memory: hidden on mobile to save space — Sync covers both flows */}
        <Link
          href="/auth"
          className="ml-2 hidden border border-neutral-700 px-3 py-2 hover:border-acid hover:text-acid sm:block"
        >
          Recall Memory
        </Link>
        <Link
          href="/auth?mode=sync"
          className="ml-1 border border-acid bg-acid/10 px-2 py-2 text-acid hover:bg-acid hover:text-ink sm:px-3"
        >
          <span className="sm:hidden">Sign in</span>
          <span className="hidden sm:inline">Sync Consciousness</span>
        </Link>
      </>
    );
  }

  // signed in but no profile yet — onboarding hasn't been finished
  if (!username) {
    return (
      <Link
        href="/auth/onboard"
        className="ml-2 border border-acid bg-acid/10 px-3 py-2 text-acid hover:bg-acid hover:text-ink"
      >
        Pick a Handle
      </Link>
    );
  }

  return (
    <div className="relative ml-2" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-neutral-700 px-3 py-2 hover:border-acid hover:text-acid"
      >
        <User className="h-3.5 w-3.5" />
        @{username}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 border border-neutral-800 bg-neutral-950">
          <Link
            href={`/profile/${username}`}
            onClick={() => setOpen(false)}
            className="block px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-neutral-300 hover:bg-neutral-900 hover:text-acid"
          >
            your profile
          </Link>
          <Link
            href="/chamber"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-neutral-300 hover:bg-neutral-900 hover:text-acid"
          >
            your vault
          </Link>
          <form action="/auth/sign-out" method="post" className="block">
            <button
              type="submit"
              className="flex w-full items-center gap-2 border-t border-neutral-900 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:bg-neutral-900 hover:text-red-400"
            >
              <LogOut className="h-3 w-3" /> sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
