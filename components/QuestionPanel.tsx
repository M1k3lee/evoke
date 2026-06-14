"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import type { Question } from "@/lib/questions";
import { cn } from "@/lib/cn";

export function QuestionPanel({
  question,
  index,
  total,
  selected,
  onSelect,
  onBack,
  onNext,
  canBack,
}: {
  question: Question;
  index: number;
  total: number;
  selected?: string;
  onSelect: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
  canBack: boolean;
}) {
  return (
    <div className="relative flex h-full min-h-[600px] flex-col border border-neutral-800 bg-neutral-950/40 p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>interrogation_{String(index + 1).padStart(2, "0")}</span>
        <span className="text-acid">// {question.field}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -24, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tighter text-neutral-100 md:text-5xl">
            {question.prompt}
          </h2>
          {question.subtitle && (
            <p className="mt-3 max-w-xl font-mono text-sm text-neutral-500">
              &gt; {question.subtitle}
            </p>
          )}

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {question.options.map((opt, i) => {
              const active = selected === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05 }}
                  onClick={() => onSelect(opt.value)}
                  className={cn(
                    "group relative flex flex-col items-start gap-1 border p-4 text-left transition-all",
                    active
                      ? "border-acid bg-acid/5 text-neutral-50"
                      : "border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/40"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-display text-lg font-extrabold uppercase tracking-tight">
                      {opt.label}
                    </span>
                    <span
                      className={cn(
                        "h-2 w-2 transition-colors",
                        active ? "bg-acid" : "bg-neutral-700 group-hover:bg-neutral-500"
                      )}
                    />
                  </div>
                  {opt.flavor && (
                    <span className="font-mono text-xs text-neutral-500">
                      &gt; {opt.flavor}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="active-shimmer"
                      className="pointer-events-none absolute inset-0 border border-acid/60 shadow-[0_0_30px_-6px_rgba(0,255,102,0.45)]"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto flex items-center justify-between pt-10">
        <button
          disabled={!canBack}
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-200 disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Rewind
        </button>
        <button
          disabled={!selected}
          onClick={onNext}
          className={cn(
            "group flex items-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            selected
              ? "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
              : "border-neutral-800 text-neutral-600"
          )}
        >
          {index === total - 1 ? "Impinstall Core" : "Next Interrogation"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
