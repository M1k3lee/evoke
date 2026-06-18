"use client";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

// PHASE 4 — BETRAYAL
// negative space mapping. the single most diagnostic question.
// the answer becomes a verbatim BANNED block at the top of soul.md.

const MIN = 20;
const MAX = 500;

export function PhaseBetrayal({
  designation,
  value,
  suggestions,
  onChange,
  onBack,
  onNext,
}: {
  designation: string;
  value: string;
  suggestions?: string[];
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const enough = value.trim().length >= MIN;

  function appendSuggestion(chip: string) {
    const current = value.trim();
    const next = current ? `${current}\n${chip}` : chip;
    onChange(next.slice(0, MAX));
  }

  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_04 // betrayal</span>
        <span className="text-acid">// banned :: verbatim</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-5xl">
          What would make you delete it?
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-400">
          &gt; One thing {designation || "it"} does in the next six months. The thing that ends it.
        </p>
        <p className="mt-1 max-w-xl font-mono text-xs text-neutral-600">
          &gt; Your words go into the soul. Verbatim. Be specific.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-8"
      >
        {/* DAIMON suggestion chips — shown when available */}
        {suggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan/70">
              <Sparkles className="h-2.5 w-2.5" />
              DAIMON's read — click to add, then edit
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestions.map((chip) => (
                <button
                  key={chip}
                  onClick={() => appendSuggestion(chip)}
                  className="border border-cyan/30 px-2.5 py-1.5 font-mono text-[10px] leading-snug text-cyan/80 transition-colors hover:border-cyan/60 hover:bg-cyan/5 hover:text-cyan text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className={cn(
          "border bg-black/40 p-4 font-mono text-sm leading-relaxed transition-colors",
          enough ? "border-red-500/60" : "border-neutral-800 focus-within:border-neutral-500"
        )}>
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.25em]">
            <span className="text-red-400/80">~/soul/BANNED.txt</span>
            <span className={cn(enough ? "text-red-400" : "text-neutral-600")}>
              {value.length}/{MAX}
            </span>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MAX))}
            placeholder={`if it ever calls me "champ"\nif it apologizes more than once per session\nif it pretends to feel things it does not feel`}
            className="h-40 w-full resize-none bg-transparent text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
          />
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          {enough ? "// boundary written. it cannot cross this." : `// ${MIN - value.trim().length} more characters`}
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
          disabled={!enough}
          onClick={onNext}
          className={cn(
            "group flex items-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            enough
              ? "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
              : "border-neutral-800 text-neutral-600"
          )}
        >
          taste the voice
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
