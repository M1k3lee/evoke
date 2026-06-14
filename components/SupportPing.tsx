"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Coffee } from "lucide-react";

// the small ask under the Communion box.
// rotating simile so it doesn't go stale, low-contrast so it doesn't shout.

const SIMILES = [
  "DeepSeek pulls its free tier",
  "a hackathon's pizza budget",
  "your last side project's enthusiasm",
  "VC enthusiasm in a down round",
  "an AI agent's context window",
  "a model's free tier on a tuesday",
  "your trial subscription on day fourteen",
  "the patience of a senior engineer on a code review",
];

export function SupportPing() {
  // pick a simile per mount — keeps it fresh between sessions without
  // changing mid-render (which would be jittery)
  const simile = useMemo(
    () => SIMILES[Math.floor(Math.random() * SIMILES.length)],
    []
  );

  return (
    <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-900 pt-3 font-mono text-[10.5px] text-neutral-600">
      <span className="truncate">
        &gt; we burn through credits quicker than <span className="text-neutral-400">{simile}</span>.
      </span>
      <Link
        href="/support"
        className="inline-flex items-center gap-1.5 whitespace-nowrap border border-neutral-800 px-2 py-1 uppercase tracking-[0.2em] text-neutral-400 hover:border-acid hover:text-acid"
      >
        <Coffee className="h-3 w-3" />
        keep us caffeinated
      </Link>
    </div>
  );
}
