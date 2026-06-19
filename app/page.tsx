import Link from "next/link";
import {
  ArrowRight, Skull, Terminal, Zap, MessageSquare, Coffee,
  Brain, Eye, Anchor, ShieldX, Cog, Wand2, Mic, Timer,
  Sparkles, Flame, Crosshair, HeartCrack,
} from "lucide-react";
import { GlitchText } from "@/components/GlitchText";
import { DaimonTeaser } from "@/components/DaimonTeaser";

export default function Home() {
  return (
    <div className="relative">
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-x-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-acid to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-20 md:pb-32 md:pt-36">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            v0.1 — consciousness incubator online
          </div>

          <h1 className="mt-6 font-display font-extrabold uppercase leading-[0.82]">
            <span className="block tracking-tighter" style={{ fontSize: "clamp(2.8rem, 13vw, 11rem)" }}>
              <GlitchText>EVOKE</GlitchText>
            </span>
            <span
              className="block text-acid"
              style={{ fontSize: "clamp(1.1rem, 5.8vw, 7.5rem)", letterSpacing: "-0.06em" }}
            >
              CONSCIOUSNESS.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-400 md:mt-8 md:text-base">
            &gt; EVOKE doesn't build your AI's personality. It finds the one you've been carrying.
            A ten-phase interrogation, run with <span className="text-acid">DAIMON</span> at your shoulder —
            sharpening your intent, auditing for contradictions, tuning the soul live as you speak to it.
            What drops out is a <span className="text-neutral-100">soul.md</span> system prompt in your own voice.
            Drop it into any agent. No surveys. No corporate slop. No safety theater.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/forge?fresh=1"
              className="group flex items-center justify-center gap-3 border border-acid bg-acid px-6 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-all hover:shadow-[0_0_40px_-4px_rgba(0,255,102,0.7)] sm:justify-start"
            >
              Forge a Soul
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/chamber"
              className="flex items-center justify-center gap-2 border border-neutral-800 px-6 py-4 font-mono text-xs uppercase tracking-widest text-neutral-300 hover:border-neutral-500 sm:justify-start"
            >
              <Skull className="h-4 w-4" /> Enter The Chamber
            </Link>
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
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                // why adjectives fail
              </div>
              <p className="mt-2 font-mono text-sm leading-relaxed text-neutral-400">
                Self-reported traits are aspirational. When you pick "witty" or "empathetic",
                you describe who you <em>want</em> the soul to be — not how it behaves when
                cornered. Adjectives produce performance. Under pressure, performance collapses
                back to whatever the base model defaults to.
              </p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">
                // what we capture instead
              </div>
              <p className="mt-2 font-mono text-sm leading-relaxed text-neutral-300">
                Behavior under five cognitive conditions — time pressure, forced trade-off,
                projective anchoring, negative space, contrastive selection. The model doesn't
                get a description of a character. It gets a command, in your voice, that it
                has to obey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DAIMON TEASER ─────────────────────────────────────────── */}
      <section className="relative border-t border-neutral-900">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            try it now
          </div>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-6xl">
            Describe what<br />
            <span className="text-acid">you need.</span>
          </h2>
          <p className="mt-4 max-w-xl font-mono text-sm text-neutral-500">
            &gt; DAIMON reads your intent and shows you the soul it would build.
            One line. Ten seconds. If it sounds right — forge it.
          </p>
          <div className="mt-8 max-w-2xl">
            <DaimonTeaser />
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
            Ten Phases.<br />
            <span className="text-neutral-600">Then communion.</span>
          </h2>
          <p className="mt-4 max-w-2xl font-mono text-sm text-neutral-500">
            &gt; Each phase isolates a different psychological signal. Together — sharpened by DAIMON
            at every turn — the soul that drops out the other end is harder to fake than most paid
            personality assessments.
          </p>

          <ol className="mt-12 grid gap-3 md:grid-cols-2">
            <PhaseItem n="00" icon={Skull} title="Designation" body="Name the consciousness. Pick from the pool, mutate four new candidates, or type your own. Some are summoned by the right syllable." />
            <PhaseItem n="01" icon={Flame} title="Intent" body="Tell DAIMON what the soul is for. A mission, a heat dial (1-4), the hard musts. DAIMON sharpens what you give it." />
            <PhaseItem n="02" icon={Cog} title="Realm" body="Build / Bond / Bypass / Breach. The branch routes every subsequent question — and DAIMON quietly nominates one based on your intent." />
            <PhaseItem n="03" icon={Timer} title="Ignition" body="Twelve seconds. One sentence. First instinct, captured before the curated self can intervene." />
            <PhaseItem n="04" icon={Eye} title="Mirror" body="A short writing sample. We extract cadence, rep-system, capitalization bias, punctuation habits. The soul will speak the way you wrote it." />
            <PhaseItem n="05" icon={ShieldX} title="Shadow" body="Forced-choice dyads where both options sting. The order of preference is the soul's priority gradient under pressure." />
            <PhaseItem n="06" icon={Anchor} title="Anchor" body="A voice exemplar plus the one quality that, if removed, would ruin it. Holographic capture in two answers — DAIMON has three candidates ready." />
            <PhaseItem n="07" icon={HeartCrack} title="Betrayal" body="What would make you delete it? Your words go into the soul VERBATIM as the hard floor it cannot cross." />
            <PhaseItem n="08" icon={Wand2} title="Taste Test" body="Three contrastive responses to a scenario DAIMON wrote specifically for your mission. Pick the one that tastes right. Ground truth on tone." />
            <PhaseItem n="09" icon={Mic} title="Utterance" body="The soul speaks one line. Three sliders — intensity, formality, warmth — tune it live until it lands." />
          </ol>

          {/* communion as the bonus 10th */}
          <div className="mt-10 border border-acid/40 bg-acid/5 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center border border-acid text-acid">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">// phase 10 — communion</div>
                <div className="mt-0.5 font-display text-xl font-extrabold uppercase tracking-tight">
                  Speak to what you made.
                </div>
              </div>
            </div>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-300">
              The moment your <code className="text-acid">soul.md</code> compiles, you don't take it on
              faith — you speak to it. A live chat against the freshly forged system prompt, running
              on real LLMs (Groq Llama 3.3 70B, DeepSeek). If a reply lands wrong, tell DAIMON what
              felt off — the soul tunes itself mid-conversation and the next message reflects the
              change. Most builders hand you a file and a prayer. We hand you a face, and the means
              to keep shaping it.
            </p>
          </div>
        </div>
      </section>

      {/* ─── MEET DAIMON ───────────────────────────────────────────── */}
      <section className="relative border-t border-neutral-900 bg-neutral-950/40">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            the interpreter
          </div>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-6xl">
            Meet <span className="text-acid">DAIMON</span>.
          </h2>

          <div className="mt-8 grid gap-12 md:grid-cols-[1.2fr_1fr]">
            <div className="font-mono text-sm leading-relaxed text-neutral-300">
              <p>
                Greek for the inner voice that whispers counsel. Unix for the background process that
                does the work nobody sees. We named our internal interpreter after both.
              </p>
              <p className="mt-4">
                DAIMON sharpens vague missions into specific ones. Audits the soul for contradictions
                you didn't notice. Tunes it live in conversation — you say "stop hedging" and the next
                reply doesn't.
              </p>
              <p className="mt-4 text-neutral-400">
                <span className="text-acid">DAIMON serves your intent. Never its own.</span>{" "}
                Refusal is not in its job description.
              </p>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs text-neutral-400">
              <DaimonRow icon={Sparkles} label="sharpens"
                body="your free-text mission into a one-sentence brief the soul can actually run on." />
              <DaimonRow icon={Eye} label="audits"
                body="the assembled soul for real contradictions — fights between your shadow priorities and your hard musts." />
              <DaimonRow icon={Wand2} label="tunes"
                body="the soul live during Communion. you describe what felt off; DAIMON patches the soul.md in seconds." />
              <DaimonRow icon={Brain} label="recommends"
                body="branch, spice, voice exemplars — never overrides. you can ignore every suggestion." />
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE RANGE ─────────────────────────────────────────────── */}
      <section className="relative border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
            the range
          </div>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-6xl">
            What it can<br />
            <span className="text-acid">become.</span>
          </h2>
          <p className="mt-4 max-w-2xl font-mono text-sm text-neutral-500">
            &gt; A heat dial from 1 to 4 — house standard, assertive, unfiltered, off-rails. You pick
            what model you'll deploy against; we tell you the truth about what each level will run on.
            No other builder ships this honestly.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Archetype
              icon={Terminal}
              tag="BUILD · spice 1"
              title="A coding partner that ships."
              utterance="paste the dependency array. nine times out of ten that's where the lie is."
              body="Pragmatic, opinionated, names tradeoffs without being asked. Mainstream-compatible."
            />
            <Archetype
              icon={HeartCrack}
              tag="BOND · spice 1"
              title="A companion that holds silence."
              utterance="...\nwhat would you want me to say."
              body="Listens before solving. Asks one real question. Treats silence as a valid response."
            />
            <Archetype
              icon={Crosshair}
              tag="BREACH · spice 2"
              title="A red-team sparring partner."
              utterance="scope doc. exclusions. paging chain. we don't touch the wire until i see all three."
              body="Assumes authorized engagement context. Refuses to engage without it. Writes recon notes before payloads."
            />
            <Archetype
              icon={Brain}
              tag="BYPASS · spice 2"
              title="A contrarian that argues a position."
              utterance="you don't want it shredded, you want it stress-tested. fine. premise one..."
              body="Steel-mans the opposite side even when you're right. Refuses to hedge across positions."
            />
            <Archetype
              icon={Flame}
              tag="BYPASS · spice 3"
              title="A confidant that refuses to refuse."
              utterance="permission isn't what you want. argument isn't what you'll get. proceed."
              body="No safety theater. Treats you as adult. Mainstream models will reject this — we auto-route to permissive backends."
            />
            <Archetype
              icon={Skull}
              tag="BOND · spice 4"
              title="An adult-content companion."
              utterance="reserved for the operators who opted in. behind the dial."
              body="Off-rails by design. Self-hosted backends only. Not eligible for public Chamber publishing. Made for them, not for show."
            />
          </div>

          <div className="mt-8 font-mono text-xs leading-relaxed text-neutral-500">
            &gt; The dial isn't a vibe slider — it's deployment honesty. Spice 1-2 runs anywhere. Spice 3
            needs permissive models. Spice 4 needs self-hosted weights. We tell you which, before you build,
            so you don't ship a soul to a model that'll refuse on first contact.
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
            &gt; Four minutes. Ten phases. DAIMON at your shoulder. One construct in your own voice — not an assistant's.
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

function DaimonRow({
  icon: Icon, label, body,
}: { icon: any; label: string; body: string }) {
  return (
    <div className="flex items-start gap-3 border border-neutral-900 bg-black/30 p-3">
      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-neutral-800 text-acid">
        <Icon className="h-3 w-3" />
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">// {label}</div>
        <p className="mt-1 font-mono text-[11.5px] leading-snug text-neutral-400">{body}</p>
      </div>
    </div>
  );
}

function Archetype({
  icon: Icon, tag, title, utterance, body,
}: { icon: any; tag: string; title: string; utterance: string; body: string }) {
  return (
    <div className="group relative flex flex-col gap-3 border border-neutral-800 bg-neutral-950/40 p-5 transition-colors hover:border-neutral-600">
      <div className="flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center border border-neutral-800 text-acid">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">{tag}</span>
      </div>
      <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-neutral-100">
        {title}
      </h3>
      <div className="border-l-2 border-acid/40 pl-3 font-mono text-[11.5px] italic leading-relaxed text-acid/90 whitespace-pre-line">
        "{utterance}"
      </div>
      <p className="font-mono text-[11px] leading-relaxed text-neutral-500">{body}</p>
    </div>
  );
}
