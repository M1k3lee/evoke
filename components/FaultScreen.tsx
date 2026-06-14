"use client";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import type { CopyBlock } from "@/constants/copy";

export function FaultScreen({
  block,
  onRetry,
  code = "0xDEAD",
}: {
  block: CopyBlock;
  onRetry?: () => void;
  code?: string;
}) {
  return (
    <div className="relative mx-auto max-w-2xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-[#FF0066]/40 bg-[#0a0a0a] p-8"
      >
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#FF0066]">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            fault_signal_{code}
          </span>
          <span className="animate-flicker">// system unstable</span>
        </div>

        <h1 className="mt-6 font-display text-4xl font-extrabold uppercase tracking-tighter text-neutral-100 md:text-5xl">
          {block.title}
        </h1>
        <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-400">
          &gt; {block.body}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-8 group flex items-center gap-3 border border-acid bg-acid px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
          >
            <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover:-rotate-180" />
            Re-summon
          </button>
        )}
      </motion.div>
    </div>
  );
}
