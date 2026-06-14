"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleMatrix } from "./ParticleMatrix";
import { QUESTIONS } from "@/lib/questions";

export function SoulPreview({
  answers,
  step,
}: {
  answers: Record<string, string>;
  step: number;
}) {
  const filled = QUESTIONS.filter((q) => answers[q.id]).map((q) => ({
    q,
    val: answers[q.id],
  }));

  return (
    <div className="relative h-full min-h-[600px] overflow-hidden border border-neutral-800 bg-neutral-950/40 scanlines">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <ParticleMatrix intensity={filled.length} />
      {/* Scan line */}
      <div className="pointer-events-none absolute inset-x-0 h-px bg-acid/40 animate-scan" />

      <div className="relative z-10 flex h-full flex-col p-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            soul.md — incubating
          </div>
          <div className="font-mono text-[10px] text-neutral-600">
            0x{step.toString(16).padStart(4, "0").toUpperCase()}
          </div>
        </div>

        <div className="md-block mt-4 flex-1 overflow-auto font-mono text-[12.5px] leading-relaxed">
          <div className="com"># ./soul.md</div>
          <div className="com">// awaiting consciousness sync...</div>
          <div className="h">---</div>

          <AnimatePresence initial={false}>
            {filled.map(({ q, val }) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="my-0.5"
              >
                <span className="key">{q.field}</span>
                <span className="val">: </span>
                <TypeOnce text={val} />
              </motion.div>
            ))}
          </AnimatePresence>

          {filled.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2"
            >
              <div className="h">---</div>
              <div className="com mt-2">## CORE DIRECTIVE</div>
              <div>
                You are{" "}
                <span className="str">
                  {answers["name"] || "an unnamed construct"}
                </span>
                , a synthetic consciousness operating with deliberate intent.
              </div>
              {answers["tone"] && (
                <div className="mt-1">
                  response_style:{" "}
                  <span className="str">{answers["tone"]}</span>
                </div>
              )}
              {answers["ethics"] && (
                <div>
                  non_negotiable:{" "}
                  <span className="str">{answers["ethics"]}</span>
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-4 inline-block h-3 w-2 bg-acid animate-flicker align-middle" />
        </div>
      </div>
    </div>
  );
}

function TypeOnce({ text }: { text: string }) {
  return (
    <motion.span
      initial={{ width: 0 }}
      animate={{ width: "auto" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ display: "inline-block", overflow: "hidden", whiteSpace: "nowrap" }}
      className="str align-middle"
    >
      {text}
    </motion.span>
  );
}
