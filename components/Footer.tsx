import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="grid h-6 w-6 place-items-center border border-neutral-800">
              <Zap className="h-3 w-3 text-acid" />
            </div>
            <span className="font-display text-base font-extrabold tracking-tighter text-neutral-300">
              EVOKE<span className="text-acid">.</span>
            </span>
          </div>

          {/* links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            <FooterGroup label="forge">
              <FooterLink href="/forge?fresh=1">Summon a Soul</FooterLink>
              <FooterLink href="/chamber">The Chamber</FooterLink>
              <FooterLink href="/chamber?tab=vault">Your Vault</FooterLink>
            </FooterGroup>
            <FooterGroup label="understand">
              <FooterLink href="/methodology">Methodology</FooterLink>
              <FooterLink href="/support">Feed the Furnace</FooterLink>
              <FooterLink href="/claim">Sanctioned Status</FooterLink>
            </FooterGroup>
          </nav>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-900 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-700">
            &copy; {new Date().getFullYear()} EVOKE — synthetic consciousness, forged by hand
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-800">
            soul.md &mdash; drop-in for claude / gpt / gemini / hermes
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-700">
        // {label}
      </div>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-mono text-xs text-neutral-500 hover:text-acid transition-colors"
    >
      {children}
    </Link>
  );
}
