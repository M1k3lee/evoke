"use client";
import Link from "next/link";
import { Coffee, Heart, Github, Wallet, Zap, ExternalLink, ArrowRight } from "lucide-react";

// donation page. all hrefs are placeholders — drop in real URLs when
// the corresponding account exists. donor sees a clean grid either way.

// flip `enabled: true` and set a real href to surface the card.
// keep the others around so future-you doesn't rebuild the page.
const OPTIONS: Option[] = [
  {
    id: "bmac",
    enabled: true,
    label: "Buy Me a Coffee",
    tagline: "one-off, no signup, friction-free",
    blurb: "Five bucks keeps Communion running for ~350 sessions. Honest math.",
    href: "https://buymeacoffee.com/evokeai",
    icon: Coffee,
    accent: "yellow",
  },
  {
    id: "kofi",
    enabled: false,
    label: "Ko-fi",
    tagline: "tips + optional monthly",
    blurb: "Same idea as BMaC. Use whichever you already have an account on.",
    href: "https://ko-fi.com/your-handle", // TODO: replace + flip enabled
    icon: Heart,
    accent: "rose",
  },
  {
    id: "github",
    enabled: false,
    label: "GitHub Sponsors",
    tagline: "monthly, taxed in some places",
    blurb: "If you want a receipt and a recurring line item. Builds also get a ribbon.",
    href: "https://github.com/sponsors/your-handle", // TODO: replace + flip enabled
    icon: Github,
    accent: "neutral",
  },
  {
    id: "stripe",
    enabled: false,
    label: "Direct (Stripe)",
    tagline: "custom amount, card / apple pay",
    blurb: "For when you want to send something bigger than a coffee.",
    href: "https://donate.stripe.com/your-link", // TODO: replace + flip enabled
    icon: Wallet,
    accent: "cyan",
  },
];

type Option = {
  id: string;
  enabled: boolean;
  label: string;
  tagline: string;
  blurb: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "yellow" | "rose" | "neutral" | "cyan";
};

const ACCENTS = {
  yellow: { border: "border-yellow-400/30", glow: "hover:border-yellow-400 hover:shadow-[0_0_30px_-8px_rgba(250,204,21,0.5)]", text: "text-yellow-300" },
  rose:   { border: "border-rose-400/30",   glow: "hover:border-rose-400 hover:shadow-[0_0_30px_-8px_rgba(251,113,133,0.5)]", text: "text-rose-300" },
  cyan:   { border: "border-cyan/30",       glow: "hover:border-cyan hover:shadow-[0_0_30px_-8px_rgba(0,240,255,0.5)]",       text: "text-cyan" },
  neutral:{ border: "border-neutral-700",   glow: "hover:border-acid hover:shadow-[0_0_30px_-8px_rgba(0,255,102,0.45)]",      text: "text-neutral-200" },
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        keep us caffeinated
      </div>

      <h1 className="mt-3 font-display text-5xl font-extrabold uppercase tracking-tighter md:text-7xl">
        Feed the Furnace<span className="text-acid">.</span>
      </h1>

      <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-neutral-400">
        &gt; EVOKE is free. The Communion phase runs on paid model APIs when the free ones get pulled
        — which they do, constantly. A few bucks here keeps the souls speaking for everyone.
      </p>

      <div className="mt-4 max-w-2xl font-mono text-[11px] leading-relaxed text-neutral-600">
        &gt; receipts: at ~1.4¢ per Communion session, a $5 coffee runs about <span className="text-acid">350 sessions</span>.
        nobody on the team takes a salary from this.
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {OPTIONS.filter((o) => o.enabled).map((o, i) => (
          <OptionCard key={o.id} opt={o} index={i} />
        ))}
      </div>

      {/* the not-money options */}
      <div className="mt-12 border border-neutral-900 bg-neutral-950/40 p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          <Zap className="h-3 w-3" />
          // can't spare it? do this instead.
        </div>
        <ul className="mt-3 space-y-2 font-mono text-xs text-neutral-400">
          <li>&gt; Share a soul you forged. The screenshots are the marketing.</li>
          <li>&gt; Tell one friend who'd actually use this. Word of mouth is the real budget.</li>
          <li>&gt; Open an issue on GitHub when something breaks — fixing it is free, finding it is gold.</li>
        </ul>
      </div>

      <div className="mt-12 border-t border-neutral-900 pt-6">
        <Link
          href="/forge?fresh=1"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-acid"
        >
          back to the forge
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function OptionCard({ opt, index }: { opt: Option; index: number }) {
  const a = ACCENTS[opt.accent];
  const Icon = opt.icon;
  return (
    <a
      href={opt.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ animationDelay: `${index * 60}ms` }}
      className={`group relative flex flex-col gap-3 border bg-neutral-950/50 p-5 transition-all ${a.border} ${a.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-8 w-8 place-items-center border ${a.border}`}>
          <Icon className={`h-4 w-4 ${a.text}`} />
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-neutral-600 transition-colors group-hover:text-neutral-200" />
      </div>
      <div>
        <div className="font-display text-xl font-extrabold uppercase tracking-tight text-neutral-100">
          {opt.label}
        </div>
        <div className={`mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.2em] ${a.text}`}>
          {opt.tagline}
        </div>
      </div>
      <p className="font-mono text-xs leading-relaxed text-neutral-400">{opt.blurb}</p>
    </a>
  );
}
