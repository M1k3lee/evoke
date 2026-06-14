"use client";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

// PHASE 3 — ANCHOR
// exemplar + delta. holographic capture in two answers.
// the "30%" framing gives permission to specify without committing
// to mimicry, which is what makes people answer honestly.

export function PhaseAnchor({
  exemplar,
  essence,
  onExemplar,
  onEssence,
  onBack,
  onNext,
}: {
  exemplar: string;
  essence: string;
  onExemplar: (v: string) => void;
  onEssence: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const ready = exemplar.trim().length > 1 && essence.trim().length > 4;

  return (
    <div className="relative flex min-h-[600px] flex-col border border-neutral-800 bg-neutral-950/40 p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_03 // anchor</span>
        <span className="text-acid">// voice exemplar</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tighter text-neutral-100 md:text-5xl">
          Name one voice it should share thirty percent of.
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-400">
          &gt; Real or fictional. Anyone whose speaking voice you'd lift one third of.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          // exemplar
        </div>
        <div className={cn(
          "mt-2 flex items-center gap-2 border bg-black/40 px-3 py-3 font-mono text-sm transition-colors",
          exemplar.trim() ? "border-acid/60" : "border-neutral-800 focus-within:border-neutral-500"
        )}>
          <span className="text-acid">&gt;</span>
          <input
            value={exemplar}
            onChange={(e) => onExemplar(e.target.value.slice(0, 60))}
            placeholder="e.g. anthony bourdain, the dad from arrival, your aunt who never apologizes..."
            className="flex-1 bg-transparent text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          // the one thing that, if removed, would ruin it
        </div>
        <div className={cn(
          "mt-2 flex items-start gap-2 border bg-black/40 px-3 py-3 font-mono text-sm transition-colors",
          essence.trim() ? "border-acid/60" : "border-neutral-800 focus-within:border-neutral-500"
        )}>
          <span className="mt-1 text-acid">&gt;</span>
          <textarea
            value={essence}
            onChange={(e) => onEssence(e.target.value.slice(0, 240))}
            placeholder="the load-bearing quality. not 'wise' — be specific. 'pauses before saying something kind.' 'never explains the joke.'"
            className="h-24 w-full resize-none bg-transparent text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
          />
        </div>
      </motion.div>

      <div className="mt-auto flex items-center justify-between pt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> rewind
        </button>
        <button
          disabled={!ready}
          onClick={onNext}
          className={cn(
            "group flex items-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            ready
              ? "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
              : "border-neutral-800 text-neutral-600"
          )}
        >
          name the betrayal
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
