"use client";
import { motion } from "framer-motion";
import { ArrowUp, Copy, GitFork } from "lucide-react";
import type { CommunitySoul } from "@/lib/souls";
import { useState } from "react";

export function SoulCard({ soul, index }: { soul: CommunitySoul; index: number }) {
  const [voted, setVoted] = useState(false);
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
        <span>~/souls/{soul.name.toLowerCase()}</span>
        <span>{soul.author}</span>
      </div>

      <h3 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tighter">
        {soul.name}
      </h3>
      <p className="mt-1 font-mono text-xs text-neutral-500">&gt; {soul.tagline}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {soul.traits.map((t) => (
          <span
            key={t}
            className="border border-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-neutral-900 pt-4">
        <button
          onClick={() => setVoted((v) => !v)}
          className={`flex items-center gap-1.5 font-mono text-xs ${
            voted ? "text-acid" : "text-neutral-400 hover:text-acid"
          }`}
        >
          <ArrowUp className="h-3.5 w-3.5" />
          {(soul.upvotes + (voted ? 1 : 0)).toLocaleString()}
        </button>
        <div className="flex gap-1">
          <button className="grid h-7 w-7 place-items-center border border-neutral-800 text-neutral-400 hover:border-acid hover:text-acid" title="Fork">
            <GitFork className="h-3.5 w-3.5" />
          </button>
          <button className="grid h-7 w-7 place-items-center border border-neutral-800 text-neutral-400 hover:border-acid hover:text-acid" title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
