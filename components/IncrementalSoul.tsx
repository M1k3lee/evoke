"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ParticleMatrix } from "./ParticleMatrix";
import { BRANCH_META } from "@/lib/branches";
import { SHADOW_DYADS } from "@/lib/dyads";
import { tasteToTone } from "@/lib/tasteTest";
import { cn } from "@/lib/cn";
import type { ForgeState } from "@/lib/types";

// THE KEYSTONE
// the soul assembles in real time, in the user's captured cadence.
// every phase adds a fragment. the user watches their own voice
// fold into the artifact. this is the moment that converts.

export function IncrementalSoul({ state }: { state: ForgeState }) {
  const intensity = fragmentCount(state);
  const meta = state.branch ? BRANCH_META[state.branch] : null;
  // mobile-only: start collapsed so the active question owns the
  // screen. desktop ignores this state entirely (always visible).
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MOBILE: collapsed handle + drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between border border-neutral-800 bg-neutral-950/60 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:border-neutral-600"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            soul.md — {intensity} fragment{intensity === 1 ? "" : "s"}
          </span>
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-2">
                <SoulPanel state={state} meta={meta} intensity={intensity} mobile />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP: classic side-by-side panel */}
      <div className="hidden lg:block">
        <SoulPanel state={state} meta={meta} intensity={intensity} />
      </div>
    </>
  );
}

function SoulPanel({
  state, meta, intensity, mobile = false,
}: {
  state: ForgeState;
  meta: ReturnType<() => typeof BRANCH_META[keyof typeof BRANCH_META]> | null;
  intensity: number;
  mobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-neutral-800 bg-neutral-950/40 scanlines",
        mobile ? "min-h-[360px]" : "h-full min-h-[600px]"
      )}
    >
      <div className="absolute inset-0 grid-bg opacity-40" />
      <ParticleMatrix intensity={intensity} />
      <div className="pointer-events-none absolute inset-x-0 h-px bg-acid/40 animate-scan" />

      <div className="relative z-10 flex h-full flex-col p-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            soul.md — assembling
          </div>
          <div className="font-mono text-[10px] text-neutral-600">
            0x{intensity.toString(16).padStart(4, "0").toUpperCase()}
          </div>
        </div>

        {/* glass backdrop keeps the soul text readable while the net dances around it */}
        <div className="md-block relative mt-4 flex-1 overflow-auto rounded-sm bg-black/55 px-3 py-2 font-mono text-[12px] leading-relaxed shadow-[inset_0_0_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-[2px] pr-1">
          <div className="com"># ./soul.md</div>
          <div className="com">// {meta ? `${meta.realmTone}` : "awaiting realm assignment..."}</div>

          <AnimatePresence initial={false}>
            {state.designation && (
              <Frag key="designation" delay={0}>
                <div className="h">---</div>
                <div><span className="key">designation</span><span className="val">: </span><span className="str">{state.designation}</span></div>
              </Frag>
            )}
            {meta && (
              <Frag key="realm" delay={0.05}>
                <div><span className="key">realm</span><span className="val">: </span><span className="str">{meta.publicLabel}</span></div>
                <div><span className="key">tone</span><span className="val">: </span><span className="str">{meta.realmTone}</span></div>
                <div className="h">---</div>
              </Frag>
            )}
            {state.designation && (
              <Frag key="title" delay={0.1}>
                <div className="mt-2 text-acid font-bold"># {state.designation}</div>
              </Frag>
            )}
            {state.ignition && (
              <Frag key="ignition" delay={0.15}>
                <div className="mt-2 text-yellow-300/90 italic">&gt; {state.ignition}</div>
              </Frag>
            )}
            {state.dna && (
              <Frag key="dna" delay={0.2}>
                <div className="mt-3 text-cyan">## VOICE</div>
                <div>- cadence: <span className="str">{state.dna.cadence}</span></div>
                <div>- rep-system: <span className="str">{state.dna.rep}</span></div>
                {state.dna.hasLowercaseBias && <div>- lowercase by default</div>}
                {state.dna.hasCapsBias && <div>- CAPS by default</div>}
                {state.dna.emDashHabit && <div>- em-dash carries the turn</div>}
                {state.dna.profanity && <div>- profanity permitted</div>}
              </Frag>
            )}
            {Object.keys(state.shadow).length > 0 && (
              <Frag key="shadow" delay={0.25}>
                <div className="mt-3 text-cyan">## SHADOW</div>
                {SHADOW_DYADS.map((d) => {
                  const c = state.shadow[d.id];
                  if (!c) return null;
                  const kept = c === "A" ? d.optionA : d.optionB;
                  return (
                    <div key={d.id}>- chooses <span className="str">{truncate(kept, 60)}</span></div>
                  );
                })}
              </Frag>
            )}
            {state.anchor.exemplar && (
              <Frag key="anchor" delay={0.3}>
                <div className="mt-3 text-cyan">## ANCHOR</div>
                <div>- voice: <span className="str">{state.anchor.exemplar}</span> (30%)</div>
                {state.anchor.essence && (
                  <div>- load-bearing: <span className="str">{truncate(state.anchor.essence, 60)}</span></div>
                )}
              </Frag>
            )}
            {state.betrayal && (
              <Frag key="betrayal" delay={0.35}>
                <div className="mt-3 text-red-400">## BANNED — VERBATIM</div>
                <pre className="whitespace-pre-wrap text-red-200/90 text-[11.5px]">{state.betrayal}</pre>
              </Frag>
            )}
            {state.tasteTest && (
              <Frag key="taste" delay={0.4}>
                <div className="mt-3 text-cyan">## DEFAULT REGISTER</div>
                <div>- <span className="str">{tasteToTone(state.tasteTest).label}</span></div>
              </Frag>
            )}
          </AnimatePresence>

          <div className="mt-4 inline-block h-3 w-2 bg-acid animate-flicker align-middle" />
        </div>
      </div>
    </div>
  );
}

function Frag({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function fragmentCount(s: ForgeState): number {
  let n = 0;
  if (s.designation) n++;
  if (s.branch) n++;
  if (s.ignition) n++;
  if (s.dna) n++;
  n += Object.keys(s.shadow).length;
  if (s.anchor.exemplar) n++;
  if (s.betrayal) n++;
  if (s.tasteTest) n++;
  return n;
}
