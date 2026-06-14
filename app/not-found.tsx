import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ERROR } from "@/constants/copy";

export default function NotFound() {
  return (
    <div className="relative mx-auto max-w-3xl px-6 py-24">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#FF0066]">
        <span className="h-1.5 w-1.5 bg-[#FF0066] animate-flicker" />
        signal_lost / 404
      </div>
      <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-tighter md:text-8xl">
        {ERROR.NOT_FOUND.title}
      </h1>
      <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-400">
        &gt; {ERROR.NOT_FOUND.body}
      </p>
      <div className="mt-10 flex gap-3">
        <Link
          href="/"
          className="group flex items-center gap-3 border border-acid bg-acid px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Retreat to base
        </Link>
        <Link
          href="/chamber"
          className="flex items-center gap-3 border border-neutral-800 px-5 py-3 font-mono text-xs uppercase tracking-widest text-neutral-300 hover:border-neutral-500"
        >
          Enter the Chamber
        </Link>
      </div>
    </div>
  );
}
