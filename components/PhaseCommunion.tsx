"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Send, RotateCcw, Wand2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { modelLabel, primaryModel } from "@/lib/models";
import { SupportPing } from "@/components/SupportPing";
import { CoherenceBanner } from "@/components/CoherenceBanner";
import type { CoherenceReport } from "@/lib/types";
import { COMMUNION_TURN_CAP } from "@/lib/types";
import type { Branch, ChatMessage, Phase } from "@/lib/types";

// PHASE 7 — COMMUNION
// the user meets the soul they made. live chat against OpenRouter.
// per-reply "this felt off" button routes back to the phase that owns it.

export function PhaseCommunion({
  designation,
  branch,
  soulMd,
  messages,
  pending,
  error,
  coherence,
  onSend,
  onJumpTo,
  onBack,
  onFinalize,
  onClear,
  onFixContradiction,
}: {
  designation: string;
  branch: Branch;
  soulMd: string;
  messages: ChatMessage[];
  pending: boolean;
  error: string | null;
  coherence?: CoherenceReport;
  onSend: (text: string) => void;
  onJumpTo: (phase: Phase) => void;
  onBack: () => void;
  onFinalize: () => void;
  onClear: () => void;
  onFixContradiction?: (c: { description: string; fields: string[]; suggestedFix: string }) => Promise<{ note: string } | null>;
}) {
  const [draft, setDraft] = useState("");
  const [reviseFor, setReviseFor] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const operatorTurns = messages.filter((m) => m.role === "operator").length;
  const remaining = Math.max(0, COMMUNION_TURN_CAP - operatorTurns);
  const exhausted = remaining === 0;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function submit() {
    const t = draft.trim();
    if (!t || pending || exhausted) return;
    onSend(t);
    setDraft("");
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const modelName = modelLabel(primaryModel(branch));

  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex flex-col items-start gap-1 text-[10px] uppercase tracking-[0.25em] text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <span>phase_07 // communion</span>
        <span className="flex items-center gap-3">
          {/* hide model label on mobile to save space — turns counter is the priority */}
          <span className="hidden text-neutral-600 sm:inline">
            model: <span className="text-cyan">{modelName}</span>
          </span>
          <span className={cn("text-acid", remaining <= 2 && "text-red-400")}>
            turns: {remaining}/{COMMUNION_TURN_CAP}
          </span>
        </span>
      </div>

      <div className="mt-6">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-4xl">
          Meet {designation || "the soul"}.
        </h2>
        <p className="mt-2 max-w-xl font-mono text-xs text-neutral-500">
          &gt; Speak to it. If something feels off, mark the reply and revise the phase that owns it.
        </p>
      </div>

      {coherence && (
        <div className="mt-4">
          <CoherenceBanner
            report={coherence}
            onJumpToPhase={onJumpTo}
            onFix={onFixContradiction ?? (async () => null)}
          />
        </div>
      )}

      <div
        ref={listRef}
        className="mt-4 flex-1 overflow-auto border border-neutral-900 bg-black/40 p-4 font-mono text-[13px] leading-relaxed"
      >
        {messages.length === 0 && !pending && (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">// awaiting first contact</div>
              <div className="mt-2 text-neutral-400">
                say anything. {designation || "it"} is listening.
              </div>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("mb-4", m.role === "operator" ? "text-neutral-200" : "text-acid")}
            >
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                {m.role === "operator" ? "operator" : designation || "soul"}
              </div>
              <div className="mt-1 whitespace-pre-wrap">{m.text}</div>

              {m.role === "soul" && (
                <div className="mt-2">
                  {reviseFor === m.id ? (
                    <ReviseMenu
                      onPick={(p) => {
                        setReviseFor(null);
                        onJumpTo(p);
                      }}
                      onCancel={() => setReviseFor(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setReviseFor(m.id)}
                      className="inline-flex items-center gap-1.5 border border-neutral-800 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:border-cyan hover:text-cyan"
                    >
                      <Wand2 className="h-3 w-3" />
                      this felt off — revise
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {pending && (
          <div className="text-acid">
            <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
              {designation || "soul"}
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="inline-block h-2 w-2 animate-flicker bg-acid" />
              <span className="ml-2 text-neutral-500">composing...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 border border-red-500/40 bg-red-500/5 p-3 font-mono text-[11px] text-red-300">
            &gt; {error}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className={cn(
          "flex items-end gap-2 border bg-black/40 px-3 py-2 transition-colors",
          exhausted ? "border-neutral-900" : "border-neutral-800 focus-within:border-neutral-500"
        )}>
          <span className="mt-2 text-acid">&gt;</span>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            disabled={pending || exhausted}
            placeholder={exhausted ? "session limit reached." : "say something. enter to send."}
            rows={1}
            className="flex-1 resize-none bg-transparent py-1 font-mono text-sm text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || pending || exhausted}
            className={cn(
              "flex items-center gap-1.5 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all",
              draft.trim() && !pending && !exhausted
                ? "border-acid bg-acid text-ink hover:shadow-[0_0_20px_-6px_rgba(0,255,102,0.7)]"
                : "border-neutral-800 text-neutral-600"
            )}
          >
            <Send className="h-3 w-3" />
            send
          </button>
        </div>
        <SupportPing />
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:text-neutral-200 sm:gap-2 sm:text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">retune voice</span>
            <span className="sm:hidden">retune</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:text-neutral-200 sm:gap-2 sm:text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">clear chat</span>
              <span className="sm:hidden">clear</span>
            </button>
          )}
        </div>
        <button
          onClick={onFinalize}
          className="group flex items-center justify-center gap-3 border border-acid bg-acid px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
        >
          install the soul
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function ReviseMenu({
  onPick,
  onCancel,
}: {
  onPick: (p: Phase) => void;
  onCancel: () => void;
}) {
  // each option maps to the phase that OWNS the property that broke
  const options: { label: string; phase: Phase; hint: string }[] = [
    { label: "voice felt wrong",    phase: "mirror",    hint: "recapture cadence" },
    { label: "broke a banned rule", phase: "betrayal",  hint: "tighten the boundary" },
    { label: "register was off",    phase: "tasteTest", hint: "recalibrate tone" },
    { label: "anchor was missing",  phase: "anchor",    hint: "revisit the exemplar" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-cyan/40 bg-cyan/5 p-3"
    >
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">
        <span>// what felt off?</span>
        <button onClick={onCancel} className="text-neutral-500 hover:text-neutral-200">cancel</button>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.label}
            onClick={() => onPick(o.phase)}
            className="flex items-center justify-between border border-neutral-800 px-3 py-2 text-left font-mono text-[11px] text-neutral-300 hover:border-cyan hover:text-cyan"
          >
            <span>{o.label}</span>
            <span className="text-[10px] text-neutral-600">→ {o.hint}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
