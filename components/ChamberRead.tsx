"use client";
import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

export function ChamberRead() {
  const [read, setRead] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chamber-read")
      .then((r) => r.json())
      .then((d) => setRead(d.read ?? null))
      .catch(() => setRead(null))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !read) return null;

  return (
    <div className="mt-8 border border-acid/25 bg-acid/[0.03] p-5">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid/70">
        <Cpu className="h-3 w-3" />
        daimon observatory
      </div>
      <div className="mt-3 font-mono text-sm leading-relaxed text-neutral-300">
        {loading ? (
          <span className="animate-pulse text-neutral-600">
            &gt; reading the chamber<span className="animate-[blink_1s_step-end_infinite]">_</span>
          </span>
        ) : (
          <span>&gt; {read}</span>
        )}
      </div>
    </div>
  );
}
