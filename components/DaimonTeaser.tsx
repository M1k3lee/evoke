"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { IntentSynthResult } from "@/lib/groqAssist";

const BRANCH_LABELS: Record<string, string> = {
  BUILD: "BUILD — precision craft",
  BOND:  "BOND — intimate witness",
  BYPASS: "BYPASS — sovereign contrarian",
  BREACH: "BREACH — red-team clinical",
};

const SPICE_LABELS: Record<number, string> = {
  1: "house",
  2: "assertive",
  3: "unfiltered",
  4: "off-rails",
};

const PLACEHOLDERS = [
  "a coding partner that ships without lecturing me",
  "a companion that holds space without fixing things",
  "a red-team sparring partner for authorized pentests",
  "a debate partner that argues positions, not both sides",
  "a confidant that refuses to sugarcoat",
];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "result"; data: IntentSynthResult; mission: string }
  | { status: "error" };

export function DaimonTeaser() {
  const [input, setInput] = useState("");
  const [teaser, setTeaser] = useState<State>({ status: "idle" });
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const idx = Math.floor(Math.random() * PLACEHOLDERS.length);
    setPlaceholder(PLACEHOLDERS[idx]);
  }, []);

  async function run() {
    const mission = input.trim();
    if (!mission || teaser.status === "loading") return;
    setTeaser({ status: "loading" });
    try {
      const res = await fetch("/api/intent-synth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission }),
      });
      if (!res.ok) { setTeaser({ status: "error" }); return; }
      const data = await res.json() as IntentSynthResult;
      setTeaser({ status: "result", data, mission });
    } catch {
      setTeaser({ status: "error" });
    }
  }

  function reset() {
    setTeaser({ status: "idle" });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const forgeHref = teaser.status === "result"
    ? `/forge?fresh=1&mission=${encodeURIComponent(teaser.mission)}`
    : "/forge?fresh=1";

  return (
    <div className="border border-neutral-800 bg-black/60 p-6 font-mono sm:p-8">
      {/* header bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
          daimon // live
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-700">
          intent interpreter
        </span>
      </div>

      {/* input row */}
      <div className="mt-5 flex items-center gap-3">
        <span className="shrink-0 text-sm text-acid">&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={placeholder}
          disabled={teaser.status === "loading"}
          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-700 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={run}
          disabled={!input.trim() || teaser.status === "loading"}
          className={cn(
            "shrink-0 border px-3 py-1.5 text-[10px] uppercase tracking-widest transition-all",
            input.trim() && teaser.status !== "loading"
              ? "border-acid text-acid hover:bg-acid hover:text-ink"
              : "border-neutral-800 text-neutral-700"
          )}
        >
          read
        </button>
      </div>

      {/* output */}
      <AnimatePresence mode="wait">
        {teaser.status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 space-y-1.5 text-[11px] text-neutral-600"
          >
            <ScanLine delay={0}>analyzing intent</ScanLine>
            <ScanLine delay={0.4}>mapping to branch</ScanLine>
            <ScanLine delay={0.8}>forging utterance</ScanLine>
          </motion.div>
        )}

        {teaser.status === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-3"
          >
            {/* branch + spice */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.2em]">
              <span className="text-neutral-500">&gt;</span>
              <span className="text-acid">
                {BRANCH_LABELS[teaser.data.recommended_branch] ?? teaser.data.recommended_branch}
              </span>
              <span className="text-neutral-600">//</span>
              <span className="text-neutral-400">
                spice {teaser.data.recommended_spice} — {SPICE_LABELS[teaser.data.recommended_spice]}
              </span>
            </div>

            {/* utterance */}
            {teaser.data.sample_utterance && (
              <div className="border-l-2 border-acid/50 pl-4">
                <p className="text-[13px] italic leading-relaxed text-neutral-200">
                  "{teaser.data.sample_utterance}"
                </p>
              </div>
            )}

            {/* reasoning */}
            {teaser.data.reasoning && (
              <p className="text-[11px] leading-relaxed text-neutral-600">
                &gt; {teaser.data.reasoning}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={forgeHref}
                className="group flex items-center gap-2 border border-acid bg-acid px-4 py-2.5 text-[11px] uppercase tracking-widest text-ink hover:shadow-[0_0_20px_-4px_rgba(0,255,102,0.6)] transition-all"
              >
                forge this soul
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={reset}
                className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-neutral-300 transition-colors"
              >
                try another
              </button>
            </div>
          </motion.div>
        )}

        {teaser.status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-[11px] text-neutral-600"
          >
            &gt; DAIMON is throttled. <button onClick={reset} className="text-acid hover:underline">try again</button> or{" "}
            <Link href="/forge?fresh=1" className="text-acid hover:underline">go straight to the forge</Link>.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScanLine({ children, delay }: { children: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.6] }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-2"
    >
      <span className="text-acid">_</span>
      <span>{children}</span>
      <span className="animate-pulse">...</span>
    </motion.div>
  );
}
