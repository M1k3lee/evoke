"use client";
import { useState } from "react";
import { AlertTriangle, X, ChevronDown, Wand2, Check, EyeOff } from "lucide-react";
import type { CoherenceReport, Phase } from "@/lib/types";
import { cn } from "@/lib/cn";

// surfaces groq's contradiction findings.
// each contradiction gets two inline actions:
//   - Fix    → calls /api/coherence-resolve, applies the patch, removes
//              the contradiction from the visible list. shows a brief
//              note about what was changed.
//   - Ignore → drops just this contradiction from the visual list.
//              other ones remain.
// (the field chips still jump to the phase if the operator wants to
// hand-fix it themselves.)

const FIELD_TO_PHASE: Record<string, Phase> = {
  mission: "intent",
  branch: "branch",
  ignition: "ignition",
  mirror: "mirror",
  shadow: "shadow",
  anchor: "anchor",
  betrayal: "betrayal",
  taste: "tasteTest",
  voice: "mirror",
  utterance: "utterance",
  hard_musts: "intent",
};

type Contradiction = NonNullable<CoherenceReport>["contradictions"][number];

export function CoherenceBanner({
  report,
  onJumpToPhase,
  onFix,
}: {
  report: CoherenceReport;
  onJumpToPhase: (p: Phase) => void;
  // returns the resolver note ("removed profanity-ok") so we can show
  // a brief inline confirmation. throws on failure.
  onFix: (c: Contradiction) => Promise<{ note: string } | null>;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);
  // per-contradiction state — keyed by index in the report's array
  const [ignored, setIgnored] = useState<Set<number>>(new Set());
  const [fixing, setFixing] = useState<Set<number>>(new Set());
  const [fixedNotes, setFixedNotes] = useState<Record<number, string>>({});
  const [fixError, setFixError] = useState<Record<number, string>>({});

  if (!report || dismissed) return null;

  if (report.allClear) {
    return (
      <div className="flex items-center justify-between border border-acid/30 bg-acid/5 px-3 py-2 font-mono text-[11px] text-acid">
        <span>// coherence check passed. no contradictions.</span>
        <button onClick={() => setDismissed(true)} aria-label="dismiss" className="text-neutral-500 hover:text-neutral-200">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  const visibleCount = report.contradictions.filter(
    (_c, i) => !ignored.has(i) && !fixedNotes[i],
  ).length;

  async function clickFix(i: number, c: Contradiction) {
    setFixError((s) => { const n = { ...s }; delete n[i]; return n; });
    setFixing((s) => new Set(s).add(i));
    try {
      const result = await onFix(c);
      if (!result) {
        setFixError((s) => ({ ...s, [i]: "resolver failed — try Ignore or revise manually" }));
      } else {
        setFixedNotes((s) => ({ ...s, [i]: result.note }));
      }
    } catch (err: any) {
      setFixError((s) => ({ ...s, [i]: err?.message ?? "fix failed" }));
    } finally {
      setFixing((s) => { const n = new Set(s); n.delete(i); return n; });
    }
  }

  return (
    <div className="border border-orange-400/40 bg-orange-400/5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 font-mono text-[11px] text-orange-300"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-3 w-3" />
          coherence: {visibleCount} {visibleCount === 1 ? "contradiction" : "contradictions"} flagged
        </span>
        <span className="flex items-center gap-2 text-neutral-500">
          <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
          <span
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            className="cursor-pointer hover:text-neutral-200"
          >
            <X className="h-3 w-3" />
          </span>
        </span>
      </button>
      {expanded && (
        <div className="border-t border-orange-400/20 px-3 py-2">
          <div className="flex flex-col gap-4">
            {report.contradictions.map((c, i) => {
              if (ignored.has(i)) return null;
              const wasFixed = !!fixedNotes[i];
              const isFixing = fixing.has(i);
              const err = fixError[i];

              if (wasFixed) {
                return (
                  <div key={i} className="border border-acid/30 bg-acid/5 px-2 py-1.5 font-mono text-[11px] text-acid">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3 w-3" />
                      fixed: <span className="text-neutral-300">{fixedNotes[i]}</span>
                    </span>
                  </div>
                );
              }

              return (
                <div key={i}>
                  <div className="font-mono text-[11.5px] text-neutral-200">
                    {c.description}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-cyan/80">
                    &gt; fix: {c.suggestedFix}
                  </div>

                  {/* primary action row: Fix / Ignore */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => clickFix(i, c)}
                      disabled={isFixing}
                      className={cn(
                        "flex items-center gap-1 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                        isFixing
                          ? "border-neutral-700 text-neutral-500"
                          : "border-cyan/50 text-cyan hover:bg-cyan/10"
                      )}
                    >
                      <Wand2 className="h-3 w-3" />
                      {isFixing ? "fixing..." : "fix"}
                    </button>
                    <button
                      onClick={() => setIgnored((s) => new Set(s).add(i))}
                      className="flex items-center gap-1 border border-neutral-700 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                    >
                      <EyeOff className="h-3 w-3" />
                      ignore
                    </button>
                    <span className="mx-1 text-neutral-700">/</span>
                    {/* manual jump chips (the original behavior) */}
                    {c.fields.map((f) => {
                      const phase = FIELD_TO_PHASE[f];
                      if (!phase) return null;
                      return (
                        <button
                          key={f}
                          onClick={() => onJumpToPhase(phase)}
                          className="border border-neutral-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 hover:border-acid hover:text-acid"
                        >
                          → {f}
                        </button>
                      );
                    })}
                  </div>
                  {err && (
                    <div className="mt-1 font-mono text-[10px] text-red-300">{err}</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 font-mono text-[10px] text-neutral-500">
            &gt; fix patches in seconds via DAIMON. ignore drops just this finding. you can always revise manually.
          </div>
        </div>
      )}
    </div>
  );
}
