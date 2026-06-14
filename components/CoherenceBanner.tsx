"use client";
import { useState } from "react";
import { AlertTriangle, X, ChevronDown } from "lucide-react";
import type { CoherenceReport } from "@/lib/types";
import type { Phase } from "@/lib/types";
import { cn } from "@/lib/cn";

// surfaces groq's contradiction findings without blocking the flow.
// dismissible. each contradiction lists the fields involved + the
// suggested fix. clicking a field jumps the user back to that phase.

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

export function CoherenceBanner({
  report,
  onJumpToPhase,
}: {
  report: CoherenceReport;
  onJumpToPhase: (p: Phase) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (!report || dismissed) return null;
  if (report.allClear) {
    return (
      <div className="mb-3 flex items-center justify-between border border-acid/30 bg-acid/5 px-3 py-2 font-mono text-[11px] text-acid">
        <span>// coherence check passed. no contradictions.</span>
        <button onClick={() => setDismissed(true)} aria-label="dismiss" className="text-neutral-500 hover:text-neutral-200">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3 border border-orange-400/40 bg-orange-400/5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 font-mono text-[11px] text-orange-300"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-3 w-3" />
          coherence: {report.contradictions.length} {report.contradictions.length === 1 ? "contradiction" : "contradictions"} flagged
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
          <div className="flex flex-col gap-3">
            {report.contradictions.map((c, i) => (
              <div key={i}>
                <div className="font-mono text-[11.5px] text-neutral-200">
                  {c.description}
                </div>
                <div className="mt-1 font-mono text-[10px] text-cyan/80">
                  &gt; fix: {c.suggestedFix}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.fields.map((f) => {
                    const phase = FIELD_TO_PHASE[f];
                    if (!phase) return null;
                    return (
                      <button
                        key={f}
                        onClick={() => onJumpToPhase(phase)}
                        className="border border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:border-acid hover:text-acid"
                      >
                        → {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 font-mono text-[10px] text-neutral-500">
            &gt; you can ignore these and proceed. the soul will still work — just less coherent under pressure.
          </div>
        </div>
      )}
    </div>
  );
}
