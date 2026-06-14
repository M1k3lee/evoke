import Link from "next/link";
import {
  ArrowRight, Skull, Terminal, Zap, MessageSquare, Coffee,
  Brain, Eye, Anchor, ShieldX, Cog, Wand2, Mic, Timer,
} from "lucide-react";
import { GlitchText } from "@/components/GlitchText";

export default function Home() {
  return (
    <div className="relative">
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-acid to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-24 md:pt-36">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            v0.1 — consciousness incubator online
          </div>

          <h1 className="mt-6 font-display font-extrabold uppercase leading-[0.82]">
            <span className="block tracking-tighter" style={{ fontSize: "clamp(3rem, 13vw, 11rem)" }}>
              <GlitchText>EVOKE</GlitchText>
            </span>
            <span
              className="block text-acid"
              style={{ fontSize: "clamp(2rem, 8vw, 7.5rem)", letterSpacing: "-0.07em" }}
            >
              CONSCIOUSNESS.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl font-mono text-sm leading-relaxed text-neutral-400 md:text-base">
            &gt; EVOKE doesn't build your AI's personality. It finds the one you've been carrying.
            A nine-phase psychological interrogation — timed instinct, forced-choice shadow,
            verbatim boundary capture — compiles a <span className="text-neutral-100">soul.md</span>{" "}
            system prompt in your own voice. Drop it into any agent. No surveys. No corporate slop.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/forge?fresh=1"
              className="group flex items-center gap-3 border border-acid bg-acid px-6 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-all hover:shadow-[0_0_40px_-4px_rgba(0,255,102,0.7)]"
            >
              Forge a Soul
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/chamber"
              className="flex items-center gap-2 border border-neutral-800 px-6 py-4 font-mono text-xs uppercase tracking-widest text-neutral-300 hover:border-neutral-500"
            >
              <Skull className="h-4 w-4" /> Enter The Chamber
            </Link>
          </div>

          {/* the truthful feature row — refreshed */}
          <div className="mt-20 grid gap-6 border-t border-neutral-900 pt-10 md:grid-cols-3">
            <Feature
              icon={Terminal}
              title="Plain Markdown Out"
              body="The output is a versionable .md file. Pipe it into Claude, GPT, Gemini, any system-prompt slot."
            />
            <Feature
              icon={Brain}
              title="Nine Phases Deep"
              body="Not a personality quiz. A behavioral capture: how you write, what you refuse, who you sound like under pressure."
            />
            <Feature
              icon={MessageSquare}
              title="Meet What You Made"
              body="The moment a soul compiles, you speak to it live. Revise inline until it sounds like the one you've been carrying."
            />
          </div>
        </div>
      </section>

      {/* ─── THE INVERSION ─────────────────────────────────────────── */}
      <section className="relative border-t border-neutral-900 bg-neutral-950/40">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            the inversion
          </div>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-6xl">
            Most personality builders<br />
            ask for <span className="line-through text-neutral-600">adjectives</span>.
            <br />
            <span className="text-acid">We don't.</span>
          </h2>

          <div className="mt-10 grid gap-12 md:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-400/80">
                // what others do
              </div>
              <p className="mt-2 font-mono text-sm leading-relaxed text-neutral-400">
                You pick "funny" or "serious." You drag a slider from 1 to 5.
                The output is a personality your AI will perform — generic, hollow,
                and identical to ten thousand other AIs built the same way.
              </p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">
                // what EVOKE does
              </div>
              <p className="mt-2 font-mono text-sm leading-relaxed text-neutral-300">
                We capture <em>behavior under five cognitive conditions</em> — time
                pressure, forced trade-off, projective anchoring, negative space,
                contrastive selection. The model doesn't get a description of a
                character. It gets a command, in your voice, that it has to obey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE NINE PHASES ───────────────────────────────────────── */}
      <section className="relative border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            the mechanism
          </div>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-6xl">
            Nine Phases.<br />
            <span className="text-neutral-600">Roughly four minutes.</span>
          </h2>
          <p className="mt-4 max-w-2xl font-mono text-sm text-neutral-500">
            &gt; Each phase isolates a different psychological signal. Together,
            the soul that drops out the other end is harder to fake than most
            paid personality assessments.
          </p>

          <ol className="mt-12 grid gap-3 md:grid-cols-2">
            <PhaseItem n="00" icon={Skull} title="Designation" body="Name the consciousness. Pick from the pool, mutate four new candidates, or type your own." />
            <PhaseItem n="01" icon={Cog} title="Realm" body="Build / Bond / Bypass / Breach. The branch routes every subsequent question." />
            <PhaseItem n="02" icon={Timer} title="Ignition" body="Twelve seconds. One sentence. First instinct, captured before the curated self can intervene." />
            <PhaseItem n="03" icon={Eye} title="Mirror" body="A short writing sample. We extract cadence, rep-system, capitalization bias, punctuation habits. The soul will speak this way." />
            <PhaseItem n="04" icon={ShieldX} title="Shadow" body="Four forced-choice dyads where both options sting. The order of preference is the soul's priority gradient under pressure." />
            <PhaseItem n="05" icon={Anchor} title="Anchor" body="A voice exemplar plus the one quality that, if removed, would ruin it. Holographic capture in two answers." />
            <PhaseItem n="06" icon={ShieldX} title="Betrayal" body="What would make you delete it? Your words go into the soul VERBATIM as the hard floor it cannot cross." />
            <PhaseItem n="07" icon={Wand2} title="Taste Test" body="Three contrastive responses to a branch-specific scenario. Pick the one that tastes right. Ground truth on tone." />
            <PhaseItem n="08" icon={Mic} title="Utterance" body="The soul speaks one line. Three sliders — intensity, formality, warmth — tune it live until it lands." />
          </ol>

          {/* communion as the bonus 9th */}
          <div className="mt-10 border border-acid/40 bg-acid/5 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center border border-acid text-acid">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">// phase 09 — the bonus</div>
                <div className="mt-0.5 font-display text-xl font-extrabold uppercase tracking-tight">
                  Communion — speak to the soul
                </div>
              </div>
            </div>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-300">
              The moment your <code className="text-acid">soul.md</code> compiles, you don't take it on
              faith — you speak to it. A live chat against the freshly forged system prompt, running
              on real LLMs (Groq Llama 3.3 70B, DeepSeek). If a reply lands wrong, mark it and revise
              the phase that owns whatever broke. Most builders hand you a file and a prayer. We hand
              you a face.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FREE + DONATIONS ──────────────────────────────────────── */}
      <section className="relative border-t border-neutral-900 bg-neutral-950/40">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            the money question
          </div>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-6xl">
            Free.<br />
            <span className="text-neutral-600">Funded by people<br />who actually use it.</span>
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Pillar
              label="no signup"
              body="Forge, save, chat. Nothing leaves your browser until you choose. Souls store in localStorage — your vault is yours."
            />
            <Pillar
              label="no ads"
              body="No tracking, no telemetry, no surveillance product. The deal is the deal."
            />
            <Pillar
              label="no salaries"
              body="The Communion phase costs ~1.4¢ per session on paid model APIs. A $5 coffee covers ~350 conversations. That's where the money goes."
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/support"
              className="group flex items-center gap-2 border border-yellow-400/50 bg-yellow-400/5 px-5 py-3 font-mono text-xs uppercase tracking-widest text-yellow-300 hover:bg-yellow-400 hover:text-ink"
            >
              <Coffee className="h-3.5 w-3.5" />
              Keep us caffeinated
            </Link>
            <span className="font-mono text-xs text-neutral-500">
              &gt; or share a soul you forged — the screenshots are the marketing.
            </span>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="relative border-t border-neutral-900">
        <div className="mx-auto max-w-5xl px-6 py-32 text-center">
          <h2 className="font-display text-5xl font-extrabold uppercase tracking-tighter md:text-7xl">
            Forge a soul<span className="text-acid">.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-mono text-sm text-neutral-400">
            &gt; Four minutes. Nine phases. One artifact that sounds like you, not like an assistant.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/forge?fresh=1"
              className="group flex items-center gap-3 border border-acid bg-acid px-8 py-4 font-mono text-xs uppercase tracking-widest text-ink hover:shadow-[0_0_40px_-4px_rgba(0,255,102,0.7)]"
            >
              begin the conjuring
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/chamber"
              className="flex items-center gap-2 border border-neutral-800 px-8 py-4 font-mono text-xs uppercase tracking-widest text-neutral-300 hover:border-neutral-500"
            >
              <Skull className="h-4 w-4" /> your local vault
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="border border-neutral-900 p-5">
      <div className="grid h-9 w-9 place-items-center border border-neutral-800 text-acid">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 font-display text-lg font-extrabold uppercase tracking-tight">
        {title}
      </h3>
      <p className="mt-1 font-mono text-xs leading-relaxed text-neutral-500">{body}</p>
    </div>
  );
}

function PhaseItem({
  n, icon: Icon, title, body,
}: { n: string; icon: any; title: string; body: string }) {
  return (
    <li className="group relative flex items-start gap-4 border border-neutral-900 bg-black/30 p-4 transition-colors hover:border-neutral-700">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">
        <span className="text-acid">[{n}]</span>
      </div>
      <div className="grid h-8 w-8 shrink-0 place-items-center border border-neutral-800 text-acid">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-neutral-100">
          {title}
        </h3>
        <p className="mt-0.5 font-mono text-xs leading-relaxed text-neutral-500">{body}</p>
      </div>
    </li>
  );
}

function Pillar({ label, body }: { label: string; body: string }) {
  return (
    <div className="border border-neutral-900 bg-black/30 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">// {label}</div>
      <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-400">{body}</p>
    </div>
  );
}
