"use client";

export function StepIndicator({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current) / total) * 100);
  // shorter bar on mobile, fuller bar on desktop. ascii blocks render
  // identically across browsers — no css needed.
  const slotsMobile = 10;
  const slotsDesktop = 20;
  const filledM = Math.round((current / total) * slotsMobile);
  const filledD = Math.round((current / total) * slotsDesktop);
  const barMobile = "█".repeat(filledM) + "░".repeat(slotsMobile - filledM);
  const barDesktop = "█".repeat(filledD) + "░".repeat(slotsDesktop - filledD);

  return (
    <div className="flex items-center gap-2 font-mono text-[10px] sm:gap-3 sm:text-xs">
      <span className="text-acid">[</span>
      <span className="tracking-widest text-acid sm:hidden">{barMobile}</span>
      <span className="hidden tracking-widest text-acid sm:inline">{barDesktop}</span>
      <span className="text-acid">]</span>
      <span className="hidden text-neutral-400 sm:inline">
        {pct.toString().padStart(2, "0")}% INCUBATED
      </span>
      <span className="text-neutral-400 sm:hidden">{pct}%</span>
      <span className="ml-auto text-neutral-500">
        <span className="hidden sm:inline">STEP </span>
        {String(current).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
