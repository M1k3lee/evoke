"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEFAULT_DESIGNATIONS, mutateNames } from "@/lib/designations";

export function DesignationStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const [pool, setPool] = useState<string[]>(DEFAULT_DESIGNATIONS);
  const [custom, setCustom] = useState("");
  const [scrambling, setScrambling] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // when user types custom, deselect cards
  useEffect(() => {
    if (custom.trim()) {
      onChange(custom.trim().toUpperCase());
    }
  }, [custom, onChange]);

  function pickCard(name: string) {
    setCustom("");
    onChange(name);
  }

  function mutate() {
    setScrambling(true);
    const newPool = mutateNames(pool);
    // short scramble animation
    let ticks = 0;
    const id = setInterval(() => {
      setPool(mutateNames(pool));
      ticks++;
      if (ticks >= 4) {
        clearInterval(id);
        setPool(newPool);
        setScrambling(false);
      }
    }, 70);
  }

  const usingCustom = !!custom.trim();

  return (
    <div className="relative flex min-h-[600px] flex-col border border-neutral-800 bg-neutral-950/40 p-8">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span>interrogation_00</span>
        <span className="text-acid">// designation</span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tighter text-neutral-100 md:text-5xl">
          What shall we call this Soul?
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-neutral-500">
          &gt; A name is a leash. Notice which one already feels like yours.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          // candidate designations
        </div>
        <button
          onClick={mutate}
          disabled={scrambling}
          className="group flex items-center gap-2 border border-neutral-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-300 hover:border-acid hover:text-acid disabled:opacity-40"
        >
          <RefreshCw className={cn("h-3 w-3 transition-transform", scrambling && "animate-spin")} />
          mutate
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {pool.map((name, i) => {
            const active = !usingCustom && value === name;
            return (
              <motion.button
                key={`${name}-${i}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
                onClick={() => pickCard(name)}
                disabled={scrambling}
                className={cn(
                  "group relative flex items-center justify-between border p-4 text-left transition-all",
                  active
                    ? "border-acid bg-acid/5 text-neutral-50"
                    : "border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/40",
                  scrambling && "opacity-60"
                )}
              >
                <span className="font-display text-lg font-extrabold uppercase tracking-tight">
                  {name}
                </span>
                <span className={cn("h-2 w-2", active ? "bg-acid" : "bg-neutral-700 group-hover:bg-neutral-500")} />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          // or define a custom designation
        </div>
        <div className={cn(
          "mt-2 flex items-center gap-2 border bg-black/40 px-3 py-3 font-mono text-sm transition-colors",
          usingCustom ? "border-acid" : "border-neutral-800 focus-within:border-neutral-500"
        )}>
          <span className="text-acid">&gt;</span>
          <input
            ref={inputRef}
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^A-Za-z0-9_\-]/g, ""))}
            placeholder="type a name. uppercase, no spaces."
            maxLength={20}
            className="flex-1 bg-transparent uppercase tracking-widest text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
          />
          {usingCustom && (
            <span className="text-[10px] uppercase tracking-[0.25em] text-acid">locked</span>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end pt-10">
        <button
          disabled={!value}
          onClick={onNext}
          className={cn(
            "group flex items-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            value
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
