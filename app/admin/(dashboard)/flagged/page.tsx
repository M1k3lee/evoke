"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, ChevronDown, ChevronUp, Loader2,
  ShieldCheck, ShieldOff, Zap, Flag,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter: { username: string } | null;
};

type FlaggedSoul = {
  id: string;
  designation: string;
  branch: string;
  visibility: string;
  flag_count: number;
  soul_md: string;
  mission: string | null;
  spice_level: number;
  created_at: string;
  profiles: { username: string; display_name: string | null } | null;
  soul_reports: Report[];
};

type AIReview = {
  severity: number;
  categories: string[];
  recommendation: "approve" | "warn" | "remove";
  summary: string;
};

const SEVERITY_COLOR = (n: number) =>
  n <= 1 ? "text-acid" : n === 2 ? "text-yellow-300" : n === 3 ? "text-orange-400" : "text-red-400";

const SEVERITY_LABEL = (n: number) =>
  ["", "Clean", "Minor", "Borderline", "Violation", "Illegal"][n] ?? "Unknown";

const REASON_LABEL: Record<string, string> = {
  illegal_content: "Illegal content",
  child_safety: "Child safety",
  hate_speech: "Hate speech",
  harassment: "Harassment",
  graphic_violence: "Graphic violence",
  spam_scam: "Spam / scam",
  impersonation: "Impersonation",
  other: "Other",
};

export default function FlaggedPage() {
  const [souls, setSouls] = useState<FlaggedSoul[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, AIReview>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [moderating, setModerating] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/flagged");
    const data = await res.json();
    if (data.error) setError(data.error);
    else setSouls(data.souls ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function runAIReview(soul: FlaggedSoul) {
    setAiLoading((p) => ({ ...p, [soul.id]: true }));
    const res = await fetch("/api/admin/ai-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        soulMd: soul.soul_md,
        designation: soul.designation,
        reports: soul.soul_reports.map((r) => r.reason),
      }),
    });
    const data = await res.json();
    if (!data.error) setAiResults((p) => ({ ...p, [soul.id]: data }));
    setAiLoading((p) => ({ ...p, [soul.id]: false }));
  }

  async function moderate(soulId: string, action: "clear" | "remove") {
    setModerating((p) => ({ ...p, [soulId]: true }));
    await fetch("/api/admin/flagged", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soulId, action }),
    });
    setSouls((p) => p.filter((s) => s.id !== soulId));
    setModerating((p) => ({ ...p, [soulId]: false }));
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 pt-12 font-mono text-xs text-neutral-600">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> loading flagged souls…
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-yellow-400">
        <AlertTriangle className="h-3 w-3" />
        moderation queue
      </div>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
        Flagged<span className="text-yellow-400">.</span>
      </h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        &gt; Souls awaiting review. DAIMON can assist with content assessment.
      </p>

      {error && (
        <p className="mt-6 font-mono text-xs text-red-400">&gt; {error}</p>
      )}

      {!error && souls.length === 0 && (
        <div className="mt-12 border border-neutral-900 p-10 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-acid" />
          <p className="mt-3 font-mono text-xs text-neutral-500">queue is clear — no souls flagged</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <AnimatePresence>
          {souls.map((soul) => {
            const isExpanded = expanded === soul.id;
            const ai = aiResults[soul.id];
            const isModerating = moderating[soul.id];

            return (
              <motion.div
                key={soul.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="border border-neutral-800 bg-neutral-950/60"
              >
                {/* summary row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : soul.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-yellow-800 bg-yellow-900/20">
                    <Flag className="h-3.5 w-3.5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-extrabold uppercase tracking-tighter">
                        {soul.designation}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-yellow-400">
                        {soul.flag_count} flag{soul.flag_count !== 1 ? "s" : ""}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                        spice {soul.spice_level}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-neutral-500">
                      by @{soul.profiles?.username ?? "unknown"} · {soul.branch} · {soul.visibility}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500" />
                  )}
                </button>

                {/* expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-neutral-900 px-5 pb-5 pt-4">
                        {/* reports */}
                        <div>
                          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                            User reports
                          </h3>
                          <div className="mt-2 flex flex-col gap-2">
                            {soul.soul_reports.map((r) => (
                              <div
                                key={r.id}
                                className="flex items-start gap-3 border border-neutral-900 px-3 py-2"
                              >
                                <span className="mt-0.5 shrink-0 border border-orange-900 bg-orange-950/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-orange-400">
                                  {REASON_LABEL[r.reason] ?? r.reason}
                                </span>
                                <div className="min-w-0">
                                  {r.details && (
                                    <p className="font-mono text-[11px] text-neutral-400">{r.details}</p>
                                  )}
                                  <p className="font-mono text-[9px] text-neutral-600">
                                    @{r.reporter?.username ?? "anon"} · {new Date(r.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* soul_md preview */}
                        <div className="mt-4">
                          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                            Soul system prompt (first 800 chars)
                          </h3>
                          <pre className="mt-2 max-h-48 overflow-auto border border-neutral-900 bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-neutral-400 whitespace-pre-wrap">
                            {soul.soul_md.slice(0, 800)}
                            {soul.soul_md.length > 800 ? "\n…" : ""}
                          </pre>
                        </div>

                        {/* AI review */}
                        <div className="mt-4">
                          <div className="flex items-center gap-3">
                            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                              DAIMON assessment
                            </h3>
                            <button
                              onClick={() => runAIReview(soul)}
                              disabled={aiLoading[soul.id]}
                              className="flex items-center gap-1.5 border border-neutral-700 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:border-acid hover:text-acid disabled:cursor-wait"
                            >
                              {aiLoading[soul.id] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Zap className="h-3 w-3" />
                              )}
                              {ai ? "re-run" : "run AI review"}
                            </button>
                          </div>

                          {ai && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 border border-neutral-800 bg-black/30 p-4"
                            >
                              <div className="flex flex-wrap items-center gap-4">
                                <div>
                                  <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">severity</div>
                                  <div className={cn("font-display text-2xl font-extrabold", SEVERITY_COLOR(ai.severity))}>
                                    {ai.severity}/5
                                    <span className="ml-2 font-mono text-xs font-normal">
                                      {SEVERITY_LABEL(ai.severity)}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">recommendation</div>
                                  <div className={cn(
                                    "font-mono text-sm uppercase tracking-widest font-semibold",
                                    ai.recommendation === "approve" ? "text-acid"
                                    : ai.recommendation === "warn" ? "text-yellow-400"
                                    : "text-red-400"
                                  )}>
                                    {ai.recommendation}
                                  </div>
                                </div>
                                {ai.categories.length > 0 && (
                                  <div>
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">categories</div>
                                    <div className="mt-0.5 flex flex-wrap gap-1">
                                      {ai.categories.map((c) => (
                                        <span key={c} className="border border-orange-900 bg-orange-950/20 px-1.5 py-0.5 font-mono text-[9px] uppercase text-orange-400">
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="mt-3 font-mono text-xs text-neutral-400">{ai.summary}</p>
                            </motion.div>
                          )}
                        </div>

                        {/* actions */}
                        <div className="mt-5 flex items-center gap-3 border-t border-neutral-900 pt-4">
                          <button
                            onClick={() => moderate(soul.id, "clear")}
                            disabled={isModerating}
                            className="flex items-center gap-1.5 border border-acid bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink disabled:cursor-wait disabled:opacity-60"
                          >
                            {isModerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                            dismiss flags
                          </button>
                          <button
                            onClick={() => moderate(soul.id, "remove")}
                            disabled={isModerating}
                            className="flex items-center gap-1.5 border border-red-800 bg-red-950/30 px-4 py-2 font-mono text-xs uppercase tracking-widest text-red-400 hover:bg-red-800/40 disabled:cursor-wait disabled:opacity-60"
                          >
                            {isModerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldOff className="h-3 w-3" />}
                            remove from public
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
