"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

// PHASE 1 — MIRROR
// no timer. they need room to write the way they actually write.
// the resulting prose is parsed into linguisticDNA and the soul
// speaks in a slightly elevated mirror of it.

const MIN_CHARS = 80;
const MAX_CHARS = 600;

export function PhaseMirror({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const enough = value.trim().length >= MIN_CHARS;

  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_01 // mirror</span>
        <span className="text-acid">// linguistic dna capture</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-5xl">
          Describe the last argument that mattered.
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-400">
          &gt; Two or three sentences. Don't explain it. Just say it.
        </p>
        <p className="mt-1 max-w-xl font-mono text-xs text-neutral-600">
          &gt; The soul will learn to speak the way you wrote this.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-8"
      >
        <div className={cn(
          "border bg-black/40 p-4 font-mono text-[13.5px] leading-relaxed transition-colors",
          enough ? "border-acid/60" : "border-neutral-800 focus-within:border-neutral-500"
        )}>
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.25em]">
            <span className="text-neutral-500">~/operator/sample.txt</span>
            <span className={cn(enough ? "text-acid" : "text-neutral-600")}>
              {value.length}/{MAX_CHARS}
            </span>
          </div>
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
            placeholder="start typing. write the way you'd write to someone who already knew the context."
            className="h-44 w-full resize-none bg-transparent text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
          />
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          {enough ? "// sample sufficient. cadence captured." : `// need ${MIN_CHARS - value.trim().length} more characters`}
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
          enter the shadow
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
