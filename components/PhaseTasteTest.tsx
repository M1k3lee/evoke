"use client";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { TASTE_SCENARIOS } from "@/lib/tasteTest";
import type { Branch, TasteOption } from "@/lib/types";

// PHASE 5 — TASTE TEST
// contrastive calibration. branch-specific scenario.
// no metacognition — just somatic recognition.

export function PhaseTasteTest({
  branch,
  value,
  onChange,
  onBack,
  onNext,
}: {
  branch: Branch;
  value: TasteOption | null;
  onChange: (v: TasteOption) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const scenario = TASTE_SCENARIOS[branch];

  return (
    <div className="relative flex min-h-[600px] flex-col border border-neutral-800 bg-neutral-950/40 p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_05 // taste test</span>
        <span className="text-acid">// contrastive calibration</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tighter text-neutral-100 md:text-5xl">
          Pick the one that tastes right.
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-400">
          &gt; Don't justify the answer. Just notice which response makes you exhale.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 border border-neutral-900 bg-black/40 p-4 font-mono text-sm leading-relaxed text-neutral-300"
      >
        <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">// scenario</div>
        <div className="mt-2 text-neutral-200">{scenario.setup}</div>
      </motion.div>

      <div className="mt-6 grid gap-3">
        <TasteCard letter="A" text={scenario.optionA} active={value === "A"} onClick={() => onChange("A")} />
        <TasteCard letter="B" text={scenario.optionB} active={value === "B"} onClick={() => onChange("B")} />
        <TasteCard letter="C" text={scenario.optionC} active={value === "C"} onClick={() => onChange("C")} />
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
          hear it speak
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function TasteCard({
  letter, text, active, onClick,
}: { letter: string; text: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "group flex items-start gap-4 border p-4 text-left font-mono text-sm transition-all",
        active
          ? "border-acid bg-acid/5 text-neutral-50"
          : "border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/40"
      )}
    >
      <span className={cn(
        "font-display text-base font-extrabold tracking-widest",
        active ? "text-acid" : "text-neutral-600"
      )}>
        [{letter}]
      </span>
      <span className="leading-snug">{text}</span>
    </motion.button>
  );
}
