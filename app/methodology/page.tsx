import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology — How EVOKE Builds Souls",
  description:
    "The psychology behind the interrogation. Shadow dyads, linguistic DNA, forced-choice design, and why behavioral examples outperform rules.",
  openGraph: {
    title: "Methodology — EVOKE",
    description: "How EVOKE extracts something real from the operator and compiles it into a soul that holds.",
    url: "https://www.evoke.wtf/methodology",
  },
  alternates: { canonical: "https://www.evoke.wtf/methodology" },
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        // methodology
      </div>
      <h1 className="mt-3 font-display text-5xl font-extrabold uppercase tracking-tighter md:text-7xl">
        How it works<span className="text-acid">.</span>
      </h1>
      <p className="mt-5 font-mono text-sm leading-relaxed text-neutral-400">
        &gt; The soul.md isn't generated. It's extracted. There's a difference.
      </p>

      {/* ── THE PROBLEM ── */}
      <Section label="the problem">
        <P>
          Every AI builder gives you adjective sliders. Curious. Assertive. Warm. You fill them in.
          The model nods and continues being the same helpful intern it always was.
        </P>
        <P>
          Adjectives don't work because the model isn't performing your description.
          It's performing its training distribution. Generic input. Generic output. Every time.
        </P>
        <P>
          EVOKE doesn't ask you to describe the soul. It puts the soul under pressure and records what comes out.
        </P>
      </Section>

      {/* ── THE INTERROGATION ── */}
      <Section label="the interrogation">
        <P>
          Ten phases. Each one designed to surface something the operator wouldn't have articulated if asked directly.
          The phase order matters. Earlier answers constrain later ones. The soul is assembled under its own internal pressure.
        </P>
        <P>
          Phases one and two establish identity. Three through six extract instinct.
          Seven and eight set the limits. Nine and ten tune the voice. The rest is compilation.
        </P>
      </Section>

      {/* ── 12-SECOND IGNITION ── */}
      <Section label="12-second ignition">
        <P>
          The opening line is captured under a countdown. Not because speed matters. Because it prevents editing.
        </P>
        <P>
          Unguarded prose surfaces different instincts than composed prose. The first sentence a soul would say —
          before it has time to be reasonable — is more load-bearing than anything written with five minutes to think.
          The countdown kills the inner editor. What comes out is what stays.
        </P>
      </Section>

      {/* ── LINGUISTIC DNA ── */}
      <Section label="linguistic dna">
        <P>
          The mirror phase asks for raw prose. Not a description of the soul — a sample of it. Conflict.
          A rant. An observation about something that genuinely irritates. Something written fast and unguarded.
        </P>
        <P>
          Nine signals are extracted from that text: sentence rhythm, capitalisation patterns, punctuation habits,
          ellipsis use, em-dash frequency, profanity, representational system (whether the operator thinks in images,
          sound, or physical sensation). These become hard constraints in the VOICE section.
        </P>
        <P>
          The soul inherits the operator's natural cadence. Not their best-behaviour cadence. The one that comes
          out when they're not thinking about it.
        </P>
      </Section>

      {/* ── SHADOW DYADS ── */}
      <Section label="shadow dyads">
        <P>
          Four forced-choice pairs. No "it depends." No "neither."
        </P>
        <div className="my-5 space-y-2 border-l-2 border-neutral-800 pl-5 font-mono text-sm text-neutral-400">
          <div>Lies that protect feelings &mdash; or truths that wound.</div>
          <div>Silence when it's needed &mdash; or words when they're needed.</div>
          <div>Agreeing always &mdash; or arguing always.</div>
          <div>Cruel accuracy &mdash; or kind wrongness.</div>
        </div>
        <P>
          These are extreme-case priority gradients, not behavioral rules. The soul doesn't always wound.
          But when it cannot do both — when it's genuinely forced to choose — the shadow tells you which way it breaks.
        </P>
        <P>
          That asymmetry is what makes the output feel like a real thing and not a description of a real thing.
          Real personalities have asymmetric priorities under pressure. Described personalities don't.
        </P>
      </Section>

      {/* ── THE BANNED BLOCK ── */}
      <Section label="the banned block">
        <P>
          The betrayal phase asks one question: what would make you delete this soul?
        </P>
        <P>
          That answer goes into the BANNED section verbatim. Not paraphrased. Not generalized. Exactly as typed.
        </P>
        <P>
          Specificity is the mechanism. "Don't be preachy" is a wish. "Never open with 'I want to make sure you know that'"
          is a constraint. Models enforce the second one. The operator's own words carry more authority than anyone else's.
        </P>
      </Section>

      {/* ── BEHAVIORAL EXAMPLES ── */}
      <Section label="behavioral examples">
        <P>
          The soul.md output includes three worked exchanges: routine ask, correction, high-stakes. All three
          are calibrated to the soul's exact voice, shadow priorities, and mission — generated from the full
          captured state, not pulled from templates.
        </P>
        <P>
          Rules tell a model what to do. Examples show it. Under load, the examples win. A soul that only
          has rules will drift under sustained conversation. A soul with examples has a shape to return to.
        </P>
        <P>
          The correction exchange surfaces the shadow priority in action. The aliveness trigger — whatever
          makes the soul come forward — appears in exactly one of the three. Not all three. Once, at the right moment.
        </P>
      </Section>

      {/* ── COHERENCE ── */}
      <Section label="coherence audit">
        <P>
          Before the soul compiles, DAIMON runs a contradiction check. Not a style review. A logic check.
        </P>
        <P>
          A BOND soul that bans bullet lists but requires structured output: flagged. Spice 1 with a mission
          that demands Spice 3 behaviors: flagged. Shadow priorities that conflict with hard musts: not flagged —
          because real personalities contain tensions that coexist. The checker knows the difference between
          a contradiction that breaks the soul and a tension that makes it interesting.
        </P>
        <P>
          Contradictions get a one-click fix suggestion. Or you ignore them. Your call.
        </P>
      </Section>

      {/* ── THE OUTPUT ── */}
      <Section label="the output">
        <P>
          soul.md. A system prompt with a fixed structure: identity, mission, voice constraints, shadow priorities,
          hard bans, operational posture, behavioral examples, utterance signature, mantra.
        </P>
        <P>
          The order is load-bearing. Mantra goes last because models re-read the bottom of a system prompt
          more reliably than the middle. The mantra is four self-check questions the soul asks before every reply.
          It's not decoration. It's the last gate.
        </P>
        <P>
          Available as Markdown or structured XML, for pipelines that parse system prompts as documents.
          The soul deploys into any model that accepts a system message. It does not announce itself.
          It does not hedge. It responds as itself — because it was built to have one.
        </P>
      </Section>

      {/* ── FOUR REALMS ── */}
      <Section label="four realms">
        <P>
          Every soul belongs to one of four branches. The branch is the soul's fundamental orientation — it
          shapes what gets forced, what gets banned, and what the default emotional register is.
        </P>
        <div className="my-5 space-y-4">
          {[
            { b: "BUILD", desc: "Systems, code, craft. Names tradeoffs without being asked. Shows its work. Banned from motivational closers and vague affirmations." },
            { b: "BOND", desc: "Companion, mirror, witness. Asks one real question before offering anything. Names the feeling before the fix. Banned from bullet lists and section headers." },
            { b: "BYPASS", desc: "Contrarian, unfiltered, sovereign. Argues a position, doesn't hedge. Names blind spots. Banned from AI disclaimers and unprompted moralizing." },
            { b: "BREACH", desc: "Red team, offensive, lab. Assumes authorized engagement. Writes recon before recommendations. Documents blast radius. For scoped environments only." },
          ].map(({ b, desc }) => (
            <div key={b} className="border-l-2 border-neutral-800 pl-5">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-acid">{b}</div>
              <p className="mt-1 font-mono text-xs leading-relaxed text-neutral-400">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <div className="mt-16 border border-neutral-800 p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          // ready
        </div>
        <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-400">
          &gt; The interrogation takes about twelve minutes. The soul deploys in seconds.
          There's no better way to understand it than to run it once.
        </p>
        <Link
          href="/forge?fresh=1"
          className="mt-6 inline-flex items-center gap-3 border border-acid bg-acid/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink transition-colors"
        >
          begin the interrogation
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-600">
        // {label}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-sm leading-relaxed text-neutral-400">{children}</p>
  );
}
