"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Timer } from "lucide-react";
import { cn } from "@/lib/cn";

// PHASE 0 — IGNITION
// timed first-line capture. the timer is psychological:
// it forces an instinct answer, not a curated one.

const SECONDS = 12;

export function PhaseIgnition({
  designation,
  value,
  onChange,
  onBack,
  onNext,
}: {
  designation: string;
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [remaining, setRemaining] = useState(SECONDS);
  const [started, setStarted] = useState(false);
  const [expired, setExpired] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!started || expired) return;
    if (remaining <= 0) {
      setExpired(true);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, started, expired]);

  function begin() {
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const charBudget = 140;

  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_00 // ignition</span>
        <span className={cn("flex items-center gap-1 font-mono", started && remaining <= 4 ? "text-red-400" : "text-acid")}>
          <Timer className="h-3 w-3" />
          {started ? `${remaining}s` : "—"}
        </span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-5xl">
          {designation || "It"} just read your mind for three seconds.
        </h2>
        <p className="mt-4 max-w-xl font-mono text-sm text-neutral-400">
          &gt; Type the first sentence it would say to you.
        </p>
        <p className="mt-1 max-w-xl font-mono text-xs text-neutral-600">
          &gt; Don't think. The timer doesn't care what you think.
        </p>
      </div>

      {!started ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10"
        >
          <button
            onClick={begin}
            className="border border-acid bg-acid/10 px-6 py-4 font-mono text-xs uppercase tracking-[0.3em] text-acid hover:bg-acid hover:text-ink"
          >
            [ start the timer ]
          </button>
          <p className="mt-3 font-mono text-[11px] text-neutral-600">
            &gt; you'll have {SECONDS} seconds the moment you press.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10"
        >
          <div className="flex items-start gap-3 border border-acid/60 bg-black/40 px-4 py-4 font-mono">
            <span className="mt-1 text-acid">&gt;</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value.slice(0, charBudget))}
              disabled={expired}
              placeholder={expired ? "time's up. keep what you got." : "first sentence..."}
              className="flex-1 bg-transparent text-base text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
            />
            <span className="mt-1 text-[10px] text-neutral-500">{value.length}/{charBudget}</span>
          </div>
          <div className="mt-3 h-1 w-full bg-neutral-900">
            <div
              className={cn("h-full transition-all", remaining <= 4 ? "bg-red-500" : "bg-acid")}
              style={{ width: `${(remaining / SECONDS) * 100}%` }}
            />
          </div>
        </motion.div>
      )}

      <div className="mt-auto flex items-center justify-between pt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> rewind
        </button>
        <button
          disabled={!value.trim()}
          onClick={onNext}
          className={cn(
            "group flex items-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            value.trim()
              ? "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
              : "border-neutral-800 text-neutral-600"
          )}
        >
          continue
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
