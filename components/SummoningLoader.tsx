"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUMMONING_CYCLE } from "@/constants/copy";
import { cn } from "@/lib/cn";

/**
 * Cycles through summoning copy every 3s while a long async op runs.
 * Pass `lines` to override (e.g. for gallery exhumation vs. soul generation).
 */
export function SummoningLoader({
  lines = SUMMONING_CYCLE,
  intervalMs = 3000,
  className,
  variant = "inline",
}: {
  lines?: readonly string[];
  intervalMs?: number;
  className?: string;
  variant?: "inline" | "overlay";
}) {
  const [i, setI] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % lines.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, lines.length]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const body = (
    <div
      className={cn(
        "relative border border-neutral-800 bg-[#0a0a0a]/90 p-6 font-mono text-xs",
        className
      )}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-neutral-500">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
          summoning_active
        </span>
        <span className="text-neutral-600">
          t+{String(elapsed).padStart(3, "0")}s
        </span>
      </div>

      <div className="mt-5 min-h-[64px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 6, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -6, filter: "blur(6px)" }}
            transition={{ duration: 0.3 }}
            className="text-acid"
          >
            <span className="text-neutral-600">&gt; </span>
            {lines[i]}
            <span className="ml-1 inline-block h-3 w-1.5 -translate-y-0.5 bg-acid align-middle animate-flicker" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-600">
        <div className="relative h-px flex-1 overflow-hidden bg-neutral-900">
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3 bg-acid"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <span>do not sever link</span>
      </div>
    </div>
  );

  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 backdrop-blur-sm">
        <div className="w-[420px] max-w-[90vw]">{body}</div>
      </div>
    );
  }
  return body;
}
