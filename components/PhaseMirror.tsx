"use client";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MirrorPromptId } from "@/lib/types";

// PHASE 1 — MIRROR
// linguistic DNA capture. the goal is unguarded prose — text written
// in the operator's actual voice, not their description of their voice.
// three prompts, all achieve the same thing via different emotional
// entry points. operator picks the one that fits them.

const MIN_CHARS = 80;
const MAX_CHARS = 600;

type Prompt = {
  id: MirrorPromptId;
  tag: string;
  label: string;
  teaser: string;
  fullPrompt: string;
  hint: string;
};

const PROMPTS: Prompt[] = [
  {
    id: "conflict",
    tag: "ARG",
    label: "the argument",
    teaser: "A moment you weren't going to let go.",
    fullPrompt: "Describe the last time you cared enough to argue about something. Not the fight — the moment before it, when you realised you weren't going to let it go.",
    hint: "write it the way you'd write to someone who already knew the context.",
  },
  {
    id: "rant",
    tag: "RNT",
    label: "the rant",
    teaser: "Something small that inexplicably bothers you.",
    fullPrompt: "Write a short rant about something small that inexplicably bothers you. No context needed. Just the thing and why.",
    hint: "don't explain yourself. just go.",
  },
  {
    id: "observation",
    tag: "OBS",
    label: "the observation",
    teaser: "Something you saw that no one else noticed.",
    fullPrompt: "Describe a moment recently when you noticed something no one else in the room did. What you saw, and what you didn't say about it.",
    hint: "be specific. the detail is the point.",
  },
];

export function PhaseMirror({
  value,
  promptId,
  onChange,
  onPromptChange,
  onBack,
  onNext,
}: {
  value: string;
  promptId: MirrorPromptId;
  onChange: (v: string) => void;
  onPromptChange: (id: MirrorPromptId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [selected, setSelected] = useState<MirrorPromptId | null>(promptId !== "conflict" || value ? promptId : null);

  useEffect(() => {
    if (selected) ref.current?.focus();
  }, [selected]);

  const activePrompt = PROMPTS.find((p) => p.id === selected);
  const enough = value.trim().length >= MIN_CHARS;

  function pick(id: MirrorPromptId) {
    if (id !== selected) onChange(""); // clear text when switching prompts
    setSelected(id);
    onPromptChange(id);
  }

  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>phase_01 // mirror</span>
        <span className="text-acid">// linguistic dna capture</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-4xl">
          Give the soul your voice.
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-400">
          &gt; We read how you write, not what you say. Pick the prompt that would make you write honestly.
        </p>
        <p className="mt-1 max-w-xl font-mono text-xs text-neutral-600">
          &gt; The soul will speak in a slightly elevated mirror of this.
        </p>
      </div>

      {/* prompt selector */}
      <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        {PROMPTS.map((p, i) => {
          const isActive = selected === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => pick(p.id)}
              className={cn(
                "group flex flex-col gap-2 border p-3 text-left transition-all duration-200 sm:p-4",
                isActive
                  ? "border-acid bg-acid/5 shadow-[0_0_20px_-6px_rgba(0,255,102,0.4)]"
                  : "border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/40"
              )}
            >
              <div className={cn(
                "font-mono text-[9px] uppercase tracking-[0.3em] transition-colors",
                isActive ? "text-acid" : "text-neutral-600 group-hover:text-neutral-400"
              )}>
                [{p.tag}]
              </div>
              <div className={cn(
                "font-display text-xs font-bold uppercase tracking-tight transition-colors sm:text-sm",
                isActive ? "text-neutral-100" : "text-neutral-400 group-hover:text-neutral-200"
              )}>
                {p.label}
              </div>
              <div className={cn(
                "font-mono text-[10px] leading-relaxed transition-colors",
                isActive ? "text-neutral-300" : "text-neutral-600 group-hover:text-neutral-500"
              )}>
                {p.teaser}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* text input — appears after a prompt is chosen */}
      <AnimatePresence mode="wait">
        {activePrompt && (
          <motion.div
            key={activePrompt.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            <div className={cn(
              "border bg-black/40 p-4 font-mono text-[13px] leading-relaxed transition-colors",
              enough ? "border-acid/60" : "border-neutral-800 focus-within:border-neutral-500"
            )}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-[11px] leading-relaxed text-neutral-400">
                  {activePrompt.fullPrompt}
                </p>
                <span className={cn(
                  "shrink-0 text-[10px] uppercase tracking-widest transition-colors",
                  enough ? "text-acid" : "text-neutral-600"
                )}>
                  {value.length}/{MAX_CHARS}
                </span>
              </div>
              <textarea
                ref={ref}
                value={value}
                onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
                placeholder={activePrompt.hint}
                className="h-36 w-full resize-none bg-transparent text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
              />
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              {enough
                ? "// sample sufficient. cadence captured."
                : `// need ${MIN_CHARS - value.trim().length} more characters`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
