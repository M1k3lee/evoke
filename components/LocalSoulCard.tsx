"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { MessageSquare, FileText, Trash2 } from "lucide-react";
import type { SoulRecord } from "@/lib/storage";
import { BRANCH_META } from "@/lib/branches";

export function LocalSoulCard({
  soul,
  index,
  onDelete,
}: {
  soul: SoulRecord;
  index: number;
  onDelete: (id: string) => void;
}) {
  const meta = soul.branch ? BRANCH_META[soul.branch] : null;
  const dateStr = new Date(soul.createdAt).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ y: -4 }}
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
        &gt; {meta ? `${meta.publicLabel} :: ${meta.realmTone}` : "no realm"}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {meta && (
          <span className="border border-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            {meta.publicLabel}
          </span>
        )}
        {soul.state.anchor.exemplar && (
          <span className="border border-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            anchor: {truncate(soul.state.anchor.exemplar, 18)}
          </span>
        )}
        {soul.state.tasteTest && (
          <span className="border border-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            {soul.state.tasteTest === "A" ? "terse" : soul.state.tasteTest === "B" ? "warm" : "provocative"}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-neutral-900 pt-4">
        <Link
          href={`/forge?load=${soul.id}&phase=communion`}
          className="flex items-center gap-1.5 border border-acid bg-acid/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-acid hover:bg-acid hover:text-ink"
        >
          <MessageSquare className="h-3 w-3" />
          speak to it
        </Link>
        <div className="flex gap-1">
          <Link
            href={`/forge?load=${soul.id}&phase=complete`}
            className="grid h-7 w-7 place-items-center border border-neutral-800 text-neutral-400 hover:border-acid hover:text-acid"
            title="View soul.md"
          >
            <FileText className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onDelete(soul.id)}
            className="grid h-7 w-7 place-items-center border border-neutral-800 text-neutral-400 hover:border-red-500 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
