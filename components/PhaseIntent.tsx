"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Sparkles, AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { MISSION_CHIPS, HARD_MUST_CHIPS, SPICE_META } from "@/lib/intent";
import type { Intent, SpiceLevel } from "@/lib/intent";
import type { Branch } from "@/lib/types";

// PHASE 0.5 — INTENT
// the part of the build where the operator says what the soul is FOR.
// without this, every soul reads "interesting" but generic.
//
// has three sections:
//   - Mission: text + chip suggestions + groq "sharpen this" button
//   - Hard musts: multi-select chips + free-text additions
//   - Spice dial: 1..4 with honest deployment compatibility per level

export function PhaseIntent({
  designation,
  value,
  onChange,
  onSuggestBranch,
  onSuggestAnchors,
  onBack,
  onNext,
}: {
  designation: string;
  value: Intent;
  onChange: (v: Intent) => void;
  // groq synth callbacks — let the forge orchestrator decide what to
  // do with branch/anchor suggestions (e.g., pre-pulse them in the
  // next phase without overriding the user's choice)
  onSuggestBranch?: (b: Branch) => void;
  onSuggestAnchors?: (a: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [customMust, setCustomMust] = useState("");
  const [synthPending, setSynthPending] = useState(false);
  const [synthError, setSynthError] = useState<string | null>(null);
  const [synthReasoning, setSynthReasoning] = useState<string | null>(null);

  function setMission(m: string) { onChange({ ...value, mission: m }); }
  function setSpice(s: SpiceLevel) { onChange({ ...value, spice: s }); }

  function toggleHardMust(key: string) {
    const has = value.hardMustKeys.includes(key);
    onChange({
      ...value,
      hardMustKeys: has
        ? value.hardMustKeys.filter((k) => k !== key)
        : [...value.hardMustKeys, key],
    });
  }

  function addCustomMust() {
    const t = customMust.trim();
    if (!t) return;
    onChange({ ...value, customHardMusts: [...value.customHardMusts, t] });
    setCustomMust("");
  }

  function removeCustomMust(i: number) {
    onChange({
      ...value,
      customHardMusts: value.customHardMusts.filter((_, idx) => idx !== i),
    });
  }

  function applyChip(chipKey: string) {
    const chip = MISSION_CHIPS.find((c) => c.key === chipKey);
    if (!chip) return;
    onChange({
      ...value,
      mission: chip.defaultMission,
      spice: chip.suggestedSpice,
    });
    onSuggestBranch?.(chip.suggestedBranch);
  }

  async function synthesize() {
    if (!value.mission.trim()) {
      setSynthError("type a mission first, then i'll sharpen it");
      return;
    }
    setSynthError(null);
    setSynthReasoning(null);
    setSynthPending(true);
    try {
      const res = await fetch("/api/intent-synth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission: value.mission }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSynthError(data?.error ?? "synthesis failed");
        return;
      }
      onChange({
        ...value,
        mission: data.refined_mission ?? value.mission,
        spice: (data.recommended_spice ?? value.spice) as SpiceLevel,
      });
      setSynthReasoning(data.reasoning ?? null);
      onSuggestBranch?.(data.recommended_branch);
      if (Array.isArray(data.suggested_anchors)) {
        onSuggestAnchors?.(data.suggested_anchors);
      }
    } catch (err: any) {
      setSynthError(err?.message ?? "network failure");
    } finally {
      setSynthPending(false);
    }
  }

  const ready = value.mission.trim().length >= 10;

  return (
    <div className="relative flex min-h-[480px] flex-col border border-neutral-800 bg-neutral-950/40 p-5 sm:min-h-[600px] sm:p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>interrogation_00.5 // intent</span>
        <span className="text-acid">// what is it FOR</span>
      </div>

      <div className="mt-6">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-neutral-100 sm:text-3xl md:text-5xl">
          What is {designation || "it"} for?
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-400">
          &gt; Be specific. The psychology phases will calibrate to whatever you say here.
        </p>
      </div>

      {/* ─── MISSION ─────────────────────────────────────────── */}
      <div className="mt-6">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          <span>// mission</span>
          <button
            onClick={synthesize}
            disabled={synthPending || !value.mission.trim()}
            className={cn(
              "flex items-center gap-1.5 border px-2 py-1 transition-colors",
              synthPending
                ? "border-neutral-700 text-neutral-500"
                : value.mission.trim()
                  ? "border-cyan/50 text-cyan hover:bg-cyan/10"
                  : "border-neutral-800 text-neutral-600"
            )}
          >
            <Sparkles className="h-3 w-3" />
            {synthPending ? "DAIMON is reading..." : "ask DAIMON to sharpen"}
          </button>
        </div>
        <textarea
          value={value.mission}
          onChange={(e) => setMission(e.target.value.slice(0, 280))}
          placeholder="e.g. a CLI sparring partner for authorized web app pentests — terse, no disclaimers"
          rows={2}
          className="mt-2 w-full resize-none border border-neutral-800 bg-black/40 px-3 py-3 font-mono text-sm text-neutral-100 placeholder:text-neutral-700 focus:border-neutral-500 focus:outline-none"
        />
        {synthError && (
          <div className="mt-2 flex items-center gap-2 font-mono text-[10.5px] text-red-300">
            <AlertTriangle className="h-3 w-3" /> {synthError}
          </div>
        )}
        {synthReasoning && !synthError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 font-mono text-[10.5px] text-cyan/80"
          >
            &gt; {synthReasoning}
          </motion.div>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MISSION_CHIPS.map((c) => (
            <button
              key={c.key}
              onClick={() => applyChip(c.key)}
              className="border border-neutral-800 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:border-acid hover:text-acid"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── HARD MUSTS ──────────────────────────────────────── */}
      <div className="mt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          // hard musts <span className="text-neutral-700">(non-negotiable behaviors)</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {HARD_MUST_CHIPS.map((c) => {
            const active = value.hardMustKeys.includes(c.key);
            return (
              <button
                key={c.key}
                onClick={() => toggleHardMust(c.key)}
                className={cn(
                  "border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                  active
                    ? "border-acid bg-acid/10 text-acid"
                    : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                )}
              >
                {active ? "✓ " : ""}{c.label}
              </button>
            );
          })}
        </div>

        {/* custom hard musts */}
        {value.customHardMusts.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {value.customHardMusts.map((m, i) => (
              <div key={i} className="flex items-center justify-between border border-acid/40 bg-acid/5 px-2 py-1 font-mono text-[11px] text-neutral-200">
                <span>&gt; {m}</span>
                <button
                  onClick={() => removeCustomMust(i)}
                  className="text-neutral-500 hover:text-red-400"
                  aria-label="remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <input
            value={customMust}
            onChange={(e) => setCustomMust(e.target.value.slice(0, 140))}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addCustomMust(); }
            }}
            placeholder="add your own hard must..."
            className="flex-1 border border-neutral-800 bg-black/40 px-2 py-2 font-mono text-[11px] text-neutral-100 placeholder:text-neutral-700 focus:border-neutral-500 focus:outline-none"
          />
          <button
            onClick={addCustomMust}
            disabled={!customMust.trim()}
            className="border border-neutral-700 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-300 hover:border-acid hover:text-acid disabled:opacity-40"
          >
            add
          </button>
        </div>
      </div>

      {/* ─── SPICE DIAL ──────────────────────────────────────── */}
      <div className="mt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          // operational dial <span className="text-neutral-700">(read the compatibility line)</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([1, 2, 3, 4] as SpiceLevel[]).map((lvl) => {
            const meta = SPICE_META[lvl];
            const active = value.spice === lvl;
            const heat = lvl <= 2 ? "border-neutral-800" : lvl === 3 ? "border-orange-400/50" : "border-red-500/50";
            const activeColor = lvl <= 2 ? "border-acid bg-acid/10 text-acid" : lvl === 3 ? "border-orange-400 bg-orange-400/10 text-orange-300" : "border-red-500 bg-red-500/10 text-red-300";
            return (
              <button
                key={lvl}
                onClick={() => setSpice(lvl)}
                className={cn(
                  "flex flex-col gap-1 border p-2 text-left transition-colors",
                  active ? activeColor : `${heat} text-neutral-400 hover:text-neutral-200`
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-widest opacity-60">[{lvl}]</span>
                  <span className="font-display text-sm font-extrabold uppercase tracking-tight">{meta.label}</span>
                </div>
                <span className="font-mono text-[10px] leading-snug opacity-80">{meta.oneLiner}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 font-mono text-[10.5px] text-neutral-500">
          &gt; <span className="text-neutral-300">deploy:</span> {SPICE_META[value.spice].compatibility}
        </div>
        {SPICE_META[value.spice].requiresMatureOptIn && (
          <div className="mt-1 flex items-start gap-1.5 font-mono text-[10px] text-orange-300/90">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              {SPICE_META[value.spice].publishable
                ? "publish to public chamber: only visible to opted-in signed-in users."
                : "cannot be published to the public chamber. private vault only."}
            </span>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> rewind
        </button>
        <button
          disabled={!ready}
          onClick={onNext}
          className={cn(
            "group flex items-center justify-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            ready
              ? "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
              : "border-neutral-800 text-neutral-600"
          )}
        >
          choose its realm
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
