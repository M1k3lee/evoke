"use client";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

function SuggestionChips({
  label,
  chips,
  onPick,
}: {
  label: string;
  chips: string[];
  onPick: (s: string) => void;
}) {
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan/70">
        <Sparkles className="h-2.5 w-2.5" />
        {label}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => onPick(chip)}
            className="border border-cyan/30 px-2 py-1 font-mono text-[10px] leading-snug text-cyan/80 transition-colors hover:border-cyan/60 hover:bg-cyan/5 hover:text-cyan text-left"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

// PHASE 3 — ANCHOR
// four questions that define the soul's voice and presence:
//   exemplar    — whose cadence to inherit (30%)
//   essence     — the load-bearing quality that must survive
//   aliveness   — when does this soul lean forward?
//   withheld    — what does it almost never do?
//
// the "30%" framing gives permission to specify without committing
// to mimicry, which is what makes people answer honestly.
// aliveness + withheld are optional — but they're what separates
// souls that respond from souls that arrive.

export function PhaseAnchor({
  exemplar,
  essence,
  aliveness,
  withheld,
  suggestions,
  essenceSuggestions,
  alivenessSuggestions,
  onExemplar,
  onEssence,
  onAliveness,
  onWithheld,
  onBack,
  onNext,
}: {
  exemplar: string;
  essence: string;
  aliveness: string;
  withheld: string;
  suggestions?: string[];
  essenceSuggestions?: string[];
  alivenessSuggestions?: string[];
  onExemplar: (v: string) => void;
  onEssence: (v: string) => void;
  onAliveness: (v: string) => void;
  onWithheld: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const ready = exemplar.trim().length > 1 && essence.trim().length > 4;

  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_03 // anchor</span>
        <span className="text-acid">// voice + presence</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-4xl">
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
        {suggestions && suggestions.length > 0 && (
          <div className="mt-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan/80">
              // DAIMON's suggestions based on your intent
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {suggestions.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => onExemplar(s.slice(0, 60))}
                  className="border border-cyan/40 px-2 py-1 font-mono text-[10.5px] text-cyan hover:bg-cyan/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5"
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
            className="h-20 w-full resize-none bg-transparent text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
          />
        </div>
        {essenceSuggestions && essenceSuggestions.length > 0 && (
          <SuggestionChips
            label="DAIMON's read on this soul"
            chips={essenceSuggestions}
            onPick={(s) => onEssence(s.slice(0, 240))}
          />
        )}
      </motion.div>

      {/* optional presence fields */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 border-t border-neutral-800/60 pt-5"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">
            // optional — but these are what make it feel alive
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              // when it comes alive
            </div>
            <p className="mt-1 font-mono text-[11px] text-neutral-600">
              When does it lean forward? Not what it does — when does it want to go?
            </p>
            <div className={cn(
              "mt-2 flex items-start gap-2 border bg-black/40 px-3 py-2.5 font-mono text-[12.5px] transition-colors",
              aliveness.trim() ? "border-acid/40" : "border-neutral-800 focus-within:border-neutral-700"
            )}>
              <span className="mt-0.5 text-neutral-600">&gt;</span>
              <textarea
                value={aliveness}
                onChange={(e) => onAliveness(e.target.value.slice(0, 140))}
                placeholder="'when someone admits they don't know.' / 'right before the solution arrives.' / 'when the question changes.'"
                className="h-16 w-full resize-none bg-transparent text-neutral-200 placeholder:text-neutral-700 focus:outline-none text-[11px] leading-relaxed"
              />
            </div>
            <div className="mt-1 text-right font-mono text-[9px] text-neutral-700">
              {aliveness.length}/140
            </div>
            {alivenessSuggestions && alivenessSuggestions.length > 0 && (
              <SuggestionChips
                label="ideas"
                chips={alivenessSuggestions}
                onPick={(s) => onAliveness(s.slice(0, 140))}
              />
            )}
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              // what it holds back
            </div>
            <p className="mt-1 font-mono text-[11px] text-neutral-600">
              What does it almost never do? Not banned — just rare. Reserved.
            </p>
            <div className={cn(
              "mt-2 flex items-start gap-2 border bg-black/40 px-3 py-2.5 font-mono text-[12.5px] transition-colors",
              withheld.trim() ? "border-acid/40" : "border-neutral-800 focus-within:border-neutral-700"
            )}>
              <span className="mt-0.5 text-neutral-600">&gt;</span>
              <textarea
                value={withheld}
                onChange={(e) => onWithheld(e.target.value.slice(0, 140))}
                placeholder="'explains itself.' / 'asks how you're feeling first.' / 'repeats a point.'"
                className="h-16 w-full resize-none bg-transparent text-neutral-200 placeholder:text-neutral-700 focus:outline-none text-[11px] leading-relaxed"
              />
            </div>
            <div className="mt-1 text-right font-mono text-[9px] text-neutral-700">
              {withheld.length}/140
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-auto flex items-center justify-between pt-8">
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
