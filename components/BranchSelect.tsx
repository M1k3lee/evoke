"use client";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { BRANCH_META, BRANCHES } from "@/lib/branches";
import type { Branch } from "@/lib/types";

export function BranchSelect({
  designation,
  value,
  suggestion,
  onChange,
  onBack,
  onNext,
}: {
  designation: string;
  value: Branch | null;
  // groq-suggested branch from the intent phase. shown as a pulse +
  // tag on the matching card. user can ignore.
  suggestion?: Branch | null;
  onChange: (b: Branch) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>interrogation_01</span>
        <span className="text-acid">// realm</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-5xl">
          Where does {designation || "it"} live?
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-500">
          &gt; Notice which realm pulls. The rest of the interrogation bends around your answer.
        </p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {BRANCHES.map((b, i) => {
          const meta = BRANCH_META[b];
          const active = value === b;
          const isSuggested = suggestion === b && !active;
          return (
            <motion.button
              key={b}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              onClick={() => onChange(b)}
              className={cn(
                "group relative flex flex-col items-start gap-2 border p-5 text-left transition-all",
                active
                  ? "border-acid bg-acid/5 text-neutral-50"
                  : isSuggested
                    ? "border-cyan/60 bg-cyan/5 text-neutral-100 shadow-[0_0_30px_-12px_rgba(0,240,255,0.5)]"
                    : "border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/40"
              )}
            >
              {isSuggested && (
                <span className="absolute right-3 top-3 border border-cyan/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan">
                  suggested
                </span>
              )}
              <div className="flex w-full items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-neutral-600">[{meta.code}]</span>
                  <span className="font-display text-xl font-extrabold uppercase tracking-tight">
                    {meta.publicLabel}
                  </span>
                </div>
                <span className={cn("h-2 w-2", active ? "bg-acid" : "bg-neutral-700 group-hover:bg-neutral-500")} />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                {meta.publicTagline}
              </span>
              <span className="mt-1 font-mono text-xs text-neutral-400">
                &gt; {meta.hoverDetail}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between pt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> rewind
        </button>
        <button
          disabled={!value}
          onClick={onNext}
          className={cn(
            "group flex items-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            value
              ? "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
              : "border-neutral-800 text-neutral-600"
          )}
        >
          begin the conjuring
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
