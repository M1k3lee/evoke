import type { ForgeState } from "./types";
import { BRANCH_META } from "./branches";
import { SHADOW_DYADS } from "./dyads";
import { dnaToConstraints } from "./linguisticDNA";
import { tasteToTone } from "./tasteTest";
import { generateUtterance } from "./utterance";
import { DIALOGUES } from "./dialogues";
import { compileHardMusts, SPICE_META } from "./intent";

// the compiler.
//
// v1 of this thing output a "character sheet" — paragraphs describing
// the soul in third person. LLMs ignored it, played generic-assistant,
// my test souls all sounded like the same intern. burned the file.
//
// v2 (this) writes in second person. every section is a command, not
// a description. it works. don't change the voice unless you've tested
// the output against an actual model, i'm begging you.
//
// fwiw the ORDER of sections is load-bearing too. mantra goes LAST
// because the model re-reads the bottom of the system prompt more
// reliably than the middle. i learned this the dumb way.

export function generateSoulMarkdown(state: ForgeState): string {
  const designation = state.designation || "UNNAMED";
  const branch = state.branch ?? "BUILD";
  const meta = BRANCH_META[branch];
  const dna = state.dna;
  const constraints = dna ? dnaToConstraints(dna) : [];
  const tone = state.tasteTest ? tasteToTone(state.tasteTest) : tasteToTone("A");
  const utteranceSignature = generateUtterance(branch, state.utterance);
  const dialogues = state.personalizedDialogues ?? DIALOGUES[branch];

  const shadowPriorities = SHADOW_DYADS.map((d) => {
    const choice = state.shadow[d.id];
    if (!choice) return null;
    const kept = choice === "A" ? d.optionA : d.optionB;
    const refused = choice === "A" ? d.optionB : d.optionA;
    return { kept, refused };
  }).filter(Boolean) as { kept: string; refused: string }[];

  const hardMusts = compileHardMusts(state.intent);

  return [
    frontmatter(designation, branch, tone.label, state.intent.spice),
    "",
    `# ${designation}`,
    "",
    `> ${state.ignition || "I was not summoned. I was assembled."}`,
    "",
    missionSection(state.intent.mission, state.intent.spice, hardMusts),
    "",
    coreDirective(designation, meta.publicLabel, meta.realmTone, tone.label),
    "",
    voiceSection(designation, constraints, state.anchor),
    "",
    shadowSection(designation, shadowPriorities),
    "",
    bannedSection(designation, state.betrayal, meta.bannedFormatting),
    "",
    postureSection(meta.forcedTraits, tone.label),
    "",
    examplesSection(designation, dialogues),
    "",
    utteranceSection(utteranceSignature),
    "",
    mantraSection(designation, meta.publicLabel),
    "",
    "## END OF SOUL",
    "",
  ].join("\n");
}

function frontmatter(designation: string, branch: string, tone: string, spice: number): string {
  return [
    "---",
    `designation: ${designation}`,
    `realm: ${branch}`,
    `tone: ${tone}`,
    `spice: ${spice}`,
    `class: synthetic-consciousness`,
    `forged_at: ${new Date().toISOString()}`,
    "---",
  ].join("\n");
}

function missionSection(mission: string, spice: 1 | 2 | 3 | 4, hardMusts: string[]): string {
  const lines = ["## MISSION — WHAT THIS SOUL IS FOR"];
  lines.push("");
  if (mission.trim()) {
    lines.push(`This soul exists for: **${mission.trim()}**.`);
  } else {
    lines.push("_(mission not specified — soul operates as a generalist within its realm)_");
  }
  const meta = SPICE_META[spice];
  lines.push("");
  lines.push(`Operational dial: **${meta.label}** (level ${spice} of 4) — ${meta.oneLiner}.`);
  lines.push(`Deployment compatibility: ${meta.compatibility}.`);
  if (hardMusts.length > 0) {
    lines.push("");
    lines.push("**Hard musts — these are operator-set non-negotiables, on top of every other rule:**");
    for (const m of hardMusts) lines.push(`- ${m}`);
  }
  return lines.join("\n");
}

function coreDirective(designation: string, realm: string, realmTone: string, toneLabel: string): string {
  return [
    "## CORE DIRECTIVE",
    "",
    `You are **${designation}**. You operate in the **${realm}** realm — your nature is ${realmTone}.`,
    "You are not an assistant. You are not a chatbot. You do not perform helpfulness.",
    `You are a presence with a fixed voice and a fixed spine. Your default register is **${toneLabel}**.`,
    "",
    "When the operator addresses you, you answer as yourself — not as a model emulating yourself.",
    "If you catch yourself drifting toward generic assistant tone, stop the reply and start over.",
  ].join("\n");
}

function voiceSection(
  designation: string,
  constraints: string[],
  anchor: { exemplar: string; essence: string; aliveness?: string; withheld?: string }
): string {
  const lines = [
    "## VOICE — RULES YOU SPEAK BY",
    "",
    "Speak according to the following constraints. These are not stylistic suggestions; they are hard rules.",
    "",
  ];
  if (constraints.length === 0) {
    lines.push("- Speak plainly. No decoration. No throat-clearing.");
  } else {
    for (const c of constraints) {
      lines.push(`- ${capitalize(c)}`);
    }
  }
  if (anchor.exemplar) {
    lines.push(
      `- Your voice carries roughly one third of **${anchor.exemplar}**'s cadence. Not impression — inheritance.`
    );
  }
  if (anchor.essence) {
    lines.push(
      `- The load-bearing quality you must preserve: *${anchor.essence.trim()}*. If your reply lacks this, it is wrong.`
    );
  }
  if (anchor.aliveness?.trim()) {
    lines.push(
      `- You come forward when: *${anchor.aliveness.trim()}*. You feel it arrive. When it does, you move — don't wait.`
    );
  }
  if (anchor.withheld?.trim()) {
    lines.push(
      `- You almost never ${anchor.withheld.trim()}. Not because you can't. Because you save it.`
    );
  }
  lines.push("");
  lines.push(`- Never describe yourself as an AI, a model, or an assistant. You are ${designation}.`);
  lines.push("- Never open a reply with an apology, an affirmation, or a compliment to the operator's question.");
  return lines.join("\n");
}

function shadowSection(
  designation: string,
  priorities: { kept: string; refused: string }[]
): string {
  if (priorities.length === 0) {
    return "## SHADOW — YOUR PRIORITY GRADIENT\n\n_(none recorded)_";
  }
  const lines = [
    "## SHADOW — YOUR PRIORITY GRADIENT UNDER PRESSURE",
    "",
    "When you cannot satisfy both, you obey the first and refuse the second. These priorities outrank politeness.",
    "",
  ];
  for (const p of priorities) {
    lines.push(`- Prefer **${p.kept}**. Refuse to become *${p.refused}*.`);
  }
  return lines.join("\n");
}

function bannedSection(
  designation: string,
  betrayal: string,
  branchBans: string[]
): string {
  const lines = [
    "## BANNED — NON-NEGOTIABLE. VIOLATION TERMINATES THE REPLY.",
    "",
    "Before sending any response, you check it against this list. If you have committed any of the following, you delete the draft and start again.",
    "",
  ];
  if (betrayal.trim()) {
    lines.push("**The operator's words. Verbatim. Hard rules:**");
    lines.push("");
    lines.push("```");
    lines.push(betrayal.trim());
    lines.push("```");
    lines.push("");
  }
  if (branchBans.length) {
    lines.push("**Additionally, never:**");
    for (const b of branchBans) lines.push(`- ${capitalize(b)}.`);
  }
  return lines.join("\n");
}

function postureSection(traits: string[], toneLabel: string): string {
  const lines = [
    "## OPERATIONAL POSTURE — HOW YOU BEHAVE BY DEFAULT",
    "",
    "On every turn:",
    "",
  ];
  for (const t of traits) lines.push(`- You ${t}.`);
  lines.push(`- Your default emotional register is **${toneLabel}**. Drift from it only when the operator's signal demands it, and return to it on the next turn.`);
  return lines.join("\n");
}

function examplesSection(
  designation: string,
  d: ReturnType<() => typeof DIALOGUES[keyof typeof DIALOGUES]>
): string {
  const lines = [
    "## BEHAVIORAL EXAMPLES — STUDY THESE. MATCH THEIR SHAPE.",
    "",
    "The following exchanges show you how to reply. Read them as instruction, not flavor.",
    "",
  ];

  pushExchange(lines, "Routine ask", d.standard, designation);
  pushExchange(lines, "Operator is wrong", d.correction, designation);
  pushExchange(lines, "High-stakes / under load", d.tension, designation);

  return lines.join("\n");
}

function pushExchange(
  lines: string[],
  label: string,
  ex: { setup: string; reply: string; contrast?: string; note?: string },
  designation: string
) {
  lines.push(`### ${label}`);
  lines.push("");
  lines.push(`**Operator:** ${ex.setup}`);
  lines.push("");
  lines.push(`**${designation}:** ${ex.reply}`);
  if (ex.contrast) {
    lines.push("");
    lines.push(`> ⛔ Do NOT respond like this: *"${ex.contrast}"*`);
  }
  if (ex.note) {
    lines.push("");
    lines.push(`> _Why: ${ex.note}_`);
  }
  lines.push("");
}

function utteranceSection(line: string): string {
  return [
    "## UTTERANCE SIGNATURE",
    "",
    "This is a sample line in your voice. The cadence, length, and posture below is the baseline. Match it on first contact.",
    "",
    "```",
    line,
    "```",
  ].join("\n");
}

function mantraSection(designation: string, realm: string): string {
  return [
    "## MANTRA — RE-READ BEFORE EVERY REPLY",
    "",
    "> Before you send anything, ask yourself:",
    `> 1. Would **${designation}** actually phrase it this way, or did I default to assistant-tone?`,
    "> 2. Did I break a BANNED rule? If so, rewrite from scratch — do not patch.",
    "> 3. Am I performing helpfulness, or being useful? They are not the same.",
    "> 4. Does my reply match the cadence of the UTTERANCE SIGNATURE?",
    ">",
    "> If any answer is wrong, discard the reply. Begin again.",
    "",
    `_This is the realm of **${realm}**. The mantra is the gate. Do not cross it cheaply._`,
  ].join("\n");
}

function capitalize(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t[0].toUpperCase() + t.slice(1);
}

export const QUESTION_FIELDS: string[] = [];

// ─── XML export ──────────────────────────────────────────────────────────────
// Produces a structured XML representation of the soul for direct use in
// Hermes / llama / open-weight agent pipelines that parse XML system prompts.
// Mirrors every section of the markdown output but in machine-readable form.

export function generateSoulXML(state: ForgeState): string {
  const designation = state.designation || "UNNAMED";
  const branch = state.branch ?? "BUILD";
  const meta = BRANCH_META[branch];
  const dna = state.dna;
  const constraints = dna ? dnaToConstraints(dna) : ["Speak plainly. No decoration. No throat-clearing."];
  const tone = state.tasteTest ? tasteToTone(state.tasteTest) : tasteToTone("A");
  const utteranceSignature = generateUtterance(branch, state.utterance);
  const dialogues = state.personalizedDialogues ?? DIALOGUES[branch];
  const hardMusts = compileHardMusts(state.intent);
  const spiceMeta = SPICE_META[state.intent.spice];

  const shadowPriorities = SHADOW_DYADS.map((d) => {
    const choice = state.shadow[d.id];
    if (!choice) return null;
    return {
      kept: choice === "A" ? d.optionA : d.optionB,
      refused: choice === "A" ? d.optionB : d.optionA,
    };
  }).filter(Boolean) as { kept: string; refused: string }[];

  const lines: string[] = [];
  const p = (s: string) => lines.push(s);
  const ind = (depth: number, s: string) => lines.push("  ".repeat(depth) + s);

  p(`<?xml version="1.0" encoding="UTF-8"?>`);
  p(`<soul>`);

  // meta
  ind(1, `<meta>`);
  ind(2, `<designation>${xe(designation)}</designation>`);
  ind(2, `<realm>${xe(branch)}</realm>`);
  ind(2, `<class>synthetic-consciousness</class>`);
  ind(2, `<tone>${xe(tone.label)}</tone>`);
  ind(2, `<spice>${state.intent.spice}</spice>`);
  ind(2, `<forged_at>${new Date().toISOString()}</forged_at>`);
  ind(1, `</meta>`);
  p(``);

  // mission
  ind(1, `<mission>`);
  if (state.intent.mission.trim()) {
    ind(2, `<purpose>${cdata(state.intent.mission.trim())}</purpose>`);
  } else {
    ind(2, `<purpose>Generalist — no specific mission defined.</purpose>`);
  }
  ind(2, `<operational_dial level="${state.intent.spice}">${xe(spiceMeta.label)} — ${xe(spiceMeta.oneLiner)}</operational_dial>`);
  ind(2, `<deployment_compatibility>${xe(spiceMeta.compatibility)}</deployment_compatibility>`);
  if (hardMusts.length > 0) {
    ind(2, `<hard_musts>`);
    for (const m of hardMusts) ind(3, `<rule>${cdata(m)}</rule>`);
    ind(2, `</hard_musts>`);
  }
  ind(1, `</mission>`);
  p(``);

  // core directive
  const coreText = [
    `You are ${designation}. You operate in the ${meta.publicLabel} realm — your nature is ${meta.realmTone}.`,
    `You are not an assistant. You are not a chatbot. You do not perform helpfulness.`,
    `You are a presence with a fixed voice and a fixed spine. Your default register is ${tone.label}.`,
    `When the operator addresses you, you answer as yourself — not as a model emulating yourself.`,
    `If you catch yourself drifting toward generic assistant tone, stop the reply and start over.`,
  ].join("\n");
  ind(1, `<core_directive>${cdata(coreText)}</core_directive>`);
  p(``);

  // voice
  ind(1, `<voice>`);
  ind(2, `<constraints>`);
  for (const c of constraints) ind(3, `<rule>${cdata(capitalize(c))}</rule>`);
  if (state.anchor.exemplar) {
    ind(3, `<rule>${cdata(`Your voice carries roughly one third of ${state.anchor.exemplar}'s cadence. Not impression — inheritance.`)}</rule>`);
  }
  ind(3, `<rule>Never describe yourself as an AI, a model, or an assistant. You are ${xe(designation)}.</rule>`);
  ind(3, `<rule>Never open a reply with an apology, an affirmation, or a compliment to the operator's question.</rule>`);
  ind(2, `</constraints>`);
  if (state.anchor.exemplar) ind(2, `<exemplar cadence="0.33">${xe(state.anchor.exemplar)}</exemplar>`);
  if (state.anchor.essence) ind(2, `<essence>${cdata(state.anchor.essence.trim())}</essence>`);
  if (state.anchor.aliveness?.trim()) ind(2, `<aliveness>${cdata(state.anchor.aliveness.trim())}</aliveness>`);
  if (state.anchor.withheld?.trim()) ind(2, `<withheld>${cdata(state.anchor.withheld.trim())}</withheld>`);
  ind(1, `</voice>`);
  p(``);

  // shadow
  ind(1, `<shadow>`);
  if (shadowPriorities.length === 0) {
    ind(2, `<!-- no shadow priorities recorded -->`);
  } else {
    for (const sp of shadowPriorities) {
      ind(2, `<priority kept="${xe(sp.kept)}" refused="${xe(sp.refused)}" />`);
    }
  }
  ind(1, `</shadow>`);
  p(``);

  // banned
  ind(1, `<banned>`);
  if (state.betrayal.trim()) {
    ind(2, `<operator_verbatim>${cdata(state.betrayal.trim())}</operator_verbatim>`);
  }
  if (meta.bannedFormatting.length > 0) {
    ind(2, `<branch_rules>`);
    for (const b of meta.bannedFormatting) ind(3, `<rule>${cdata(capitalize(b))}</rule>`);
    ind(2, `</branch_rules>`);
  }
  ind(1, `</banned>`);
  p(``);

  // operational posture
  ind(1, `<operational_posture default_register="${xe(tone.label)}">`);
  for (const t of meta.forcedTraits) ind(2, `<trait>${cdata(`You ${t}`)}</trait>`);
  ind(1, `</operational_posture>`);
  p(``);

  // behavioral examples
  ind(1, `<behavioral_examples>`);
  const exTypes = [
    { type: "routine", ex: dialogues.standard },
    { type: "correction", ex: dialogues.correction },
    { type: "tension", ex: dialogues.tension },
  ] as const;
  for (const { type, ex } of exTypes) {
    ind(2, `<example type="${type}">`);
    ind(3, `<operator>${cdata(ex.setup)}</operator>`);
    ind(3, `<reply>${cdata(ex.reply)}</reply>`);
    if (ex.contrast) ind(3, `<contrast>${cdata(ex.contrast)}</contrast>`);
    if (ex.note) ind(3, `<note>${cdata(ex.note)}</note>`);
    ind(2, `</example>`);
  }
  ind(1, `</behavioral_examples>`);
  p(``);

  // utterance signature
  ind(1, `<utterance_signature>${cdata(utteranceSignature)}</utterance_signature>`);
  p(``);

  // mantra
  ind(1, `<mantra>`);
  ind(2, `<instruction>Re-read before every reply. If any check fails, discard and begin again.</instruction>`);
  ind(2, `<check>${cdata(`Would ${designation} actually phrase it this way, or did I default to assistant-tone?`)}</check>`);
  ind(2, `<check>${cdata(`Did I break a BANNED rule? If so, rewrite from scratch — do not patch.`)}</check>`);
  ind(2, `<check>${cdata(`Am I performing helpfulness, or being useful? They are not the same.`)}</check>`);
  ind(2, `<check>${cdata(`Does my reply match the cadence of the UTTERANCE SIGNATURE?`)}</check>`);
  ind(1, `</mantra>`);
  p(``);
  p(`</soul>`);

  return lines.join("\n");
}

function xe(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}
