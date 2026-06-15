"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, MessageSquare, AlertOctagon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { BRANCH_META } from "@/lib/branches";
import { toggleVote } from "@/lib/db/votes";
import type { CloudSoulWithAuthor } from "@/lib/db/souls";
import { ReportModal } from "@/components/ReportModal";

export function PublicSoulGrid({
  souls,
  signedIn,
}: {
  souls: CloudSoulWithAuthor[];
  signedIn: boolean;
}) {
  if (souls.length === 0) {
    return (
      <div className="mt-10 border border-neutral-900 bg-neutral-950/40 p-12 text-center">
        <div className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-300">
          no public souls yet
        </div>
        <p className="mt-2 font-mono text-xs text-neutral-500">
          &gt; The chamber is waiting for its first construct. Want to break the seal?
        </p>
        <Link
          href="/forge?fresh=1"
          className="mt-6 inline-flex items-center gap-2 border border-acid bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
        >
          forge a soul →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {souls.map((s, i) => (
        <PublicSoulCard key={s.id} soul={s} index={i} signedIn={signedIn} />
      ))}
    </div>
  );
}

function PublicSoulCard({
  soul, index, signedIn,
}: {
  soul: CloudSoulWithAuthor;
  index: number;
  signedIn: boolean;
}) {
  const [voted, setVoted] = useState(soul.voted);
  const [count, setCount] = useState(soul.upvote_count);
  const [voting, setVoting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const meta = BRANCH_META[soul.branch];
  const dateStr = new Date(soul.created_at).toLocaleString(undefined, {
    month: "short", day: "numeric",
  });

  async function onVote() {
    if (!signedIn) {
      window.location.href = "/auth";
      return;
    }
    if (voting) return;
    // optimistic
    const wasVoted = voted;
    setVoted(!wasVoted);
    setCount(c => c + (wasVoted ? -1 : 1));
    setVoting(true);
    const result = await toggleVote(soul.id);
    setVoting(false);
    if (result.error) {
      // revert
      setVoted(wasVoted);
      setCount(c => c + (wasVoted ? 1 : -1));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col border border-neutral-800 bg-neutral-950/50 p-5 transition-colors hover:border-neutral-600"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 border border-acid/40 shadow-[0_0_40px_-8px_rgba(0,255,102,0.4)]" />
      </div>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>~/souls/{soul.designation.toLowerCase()}</span>
        <span className="text-neutral-600">{dateStr}</span>
      </div>

      <h3 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tighter">
        {soul.designation}
      </h3>
      <p className="mt-1 font-mono text-xs text-neutral-500">
        &gt; {meta.publicLabel} :: {meta.realmTone}
      </p>
      {soul.author && (
        <Link
          href={`/profile/${soul.author.username}`}
          className="mt-1 font-mono text-[10.5px] text-neutral-500 hover:text-acid"
        >
          by @{soul.author.username}
        </Link>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="border border-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          {meta.publicLabel}
        </span>
        {soul.state_json.anchor?.exemplar && (
          <span className="border border-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            ⌂ {truncate(soul.state_json.anchor.exemplar, 18)}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-neutral-900 pt-4">
        <button
          onClick={onVote}
          disabled={voting}
          className={cn(
            "flex items-center gap-1.5 font-mono text-xs transition-colors",
            voted ? "text-acid" : "text-neutral-400 hover:text-acid"
          )}
          aria-label={voted ? "remove upvote" : "upvote"}
        >
          <ArrowUp className={cn("h-3.5 w-3.5", voted && "fill-acid")} />
          {count.toLocaleString()}
        </button>
        <div className="flex gap-1">
          <Link
            href={`/forge?cloud=${soul.id}&phase=communion`}
            className="grid h-7 w-7 place-items-center border border-neutral-800 text-neutral-400 hover:border-acid hover:text-acid"
            title="Speak to this soul"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/forge?cloud=${soul.id}&phase=complete`}
            className="grid h-7 w-7 place-items-center border border-neutral-800 text-neutral-400 hover:border-acid hover:text-acid"
            title="View soul.md / fork"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => {
              if (!signedIn) { window.location.href = "/auth"; return; }
              setReporting(true);
            }}
            className="grid h-7 w-7 place-items-center border border-neutral-800 text-neutral-400 hover:border-red-500 hover:text-red-400"
            title="Report this soul"
          >
            <AlertOctagon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {reporting && (
        <ReportModal
          soulId={soul.id}
          soulName={soul.designation}
          onClose={() => setReporting(false)}
        />
      )}
    </motion.div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
