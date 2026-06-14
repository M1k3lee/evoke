"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { SHADOW_DYADS } from "@/lib/dyads";
import type { DyadChoice } from "@/lib/types";

// PHASE 2 — SHADOW
// forced-choice dyads, no timer.
// both options sting. the priority order surfaces.

export function PhaseShadow({
  choices,
  onChange,
  onBack,
  onNext,
}: {
  choices: Record<string, DyadChoice>;
  onChange: (id: string, c: DyadChoice) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const total = SHADOW_DYADS.length;
  const answered = SHADOW_DYADS.filter((d) => choices[d.id]).length;
  const complete = answered === total;

  return (
    <div className="relative flex min-h-[600px] flex-col border border-neutral-800 bg-neutral-950/40 p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_02 // shadow</span>
        <span className="text-acid">// forced-choice :: {answered}/{total}</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tighter text-neutral-100 md:text-5xl">
          You can't pick neither.
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-400">
          &gt; Both are bad. Notice which bad you can live with.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-5 overflow-auto pr-1">
        <AnimatePresence initial={false}>
          {SHADOW_DYADS.map((d, i) => {
            const choice = choices[d.id];
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="border border-neutral-900 bg-black/30 p-4"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  {d.prompt}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <DyadButton label="A" text={d.optionA} active={choice === "A"} onClick={() => onChange(d.id, "A")} />
                  <DyadButton label="B" text={d.optionB} active={choice === "B"} onClick={() => onChange(d.id, "B")} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-auto flex items-center justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> rewind
        </button>
        <button
          disabled={!complete}
          onClick={onNext}
          className={cn(
            "group flex items-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            complete
              ? "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
              : "border-neutral-800 text-neutral-600"
          )}
        >
          name the anchor
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function DyadButton({
  label,
  text,
  active,
  onClick,
}: {
  label: string;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 border p-3 text-left font-mono text-sm transition-all",
        active
          ? "border-acid bg-acid/5 text-neutral-50"
          : "border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/40"
      )}
    >
      <span className={cn(
        "font-display text-xs font-extrabold tracking-widest",
        active ? "text-acid" : "text-neutral-600"
      )}>
        [{label}]
      </span>
      <span className="leading-snug">{text}</span>
    </button>
  );
}
