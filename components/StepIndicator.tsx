"use client";

export function StepIndicator({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current) / total) * 100);
  const filled = Math.round((current / total) * 20);
  const bar = "█".repeat(filled) + "░".repeat(20 - filled);
  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <span className="text-acid">[</span>
      <span className="tracking-widest text-acid">{bar}</span>
      <span className="text-acid">]</span>
      <span className="text-neutral-400">
        {pct.toString().padStart(2, "0")}% INCUBATED
      </span>
      <span className="ml-auto text-neutral-500">
        STEP {String(current).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
