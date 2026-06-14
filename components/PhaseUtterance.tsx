"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { generateUtterance } from "@/lib/utterance";
import type { Branch, UtteranceTuning } from "@/lib/types";

// PHASE 6 — UTTERANCE
// the soul speaks once. user tunes three sliders.
// reinforcement-learning-shaped, compressed into 30 seconds.

export function PhaseUtterance({
  designation,
  branch,
  tuning,
  onChange,
  onBack,
  onNext,
}: {
  designation: string;
  branch: Branch;
  tuning: UtteranceTuning;
  onChange: (t: UtteranceTuning) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const line = useMemo(
    () => generateUtterance(branch, tuning),
    [branch, tuning]
  );

  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_06 // utterance</span>
        <span className="text-acid">// live tuning</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-5xl">
          Listen. Then tune.
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-400">
          &gt; {designation || "It"} speaks. Adjust until it sounds like the one you've been carrying.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 border border-acid/40 bg-black/50 p-5"
      >
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-acid">
          <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
          {designation || "soul"} :: speaking
        </div>
        <motion.div
          key={line}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.35 }}
          className="mt-3 font-mono text-base leading-relaxed text-neutral-100"
        >
          "{line}"
        </motion.div>
      </motion.div>

      <div className="mt-6 grid gap-5">
        <Slider
          label="intensity"
          hint="quiet ↔ jagged"
          value={tuning.intensity}
          onChange={(v) => onChange({ ...tuning, intensity: v })}
        />
        <Slider
          label="formality"
          hint="lowercase ↔ ceremonial"
          value={tuning.formality}
          onChange={(v) => onChange({ ...tuning, formality: v })}
        />
        <Slider
          label="warmth"
          hint="surgical ↔ tender"
          value={tuning.warmth}
          onChange={(v) => onChange({ ...tuning, warmth: v })}
        />
      </div>

      <div className="mt-auto flex items-center justify-between pt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> rewind
        </button>
        <button
          onClick={onNext}
          className="group flex items-center gap-3 border border-acid bg-acid px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-all hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
        >
          install the soul
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.25em]">
        <span className="text-neutral-400">// {label}</span>
        <span className="text-neutral-600">{hint}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[#00FF66]"
      />
    </div>
  );
}
