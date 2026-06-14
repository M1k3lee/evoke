"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { INITIAL_STATE, PHASE_ORDER, withFreshCommunion } from "@/lib/types";
import type { Branch, ChatMessage, DyadChoice, ForgeState, Phase, PersonalizedTaste, TasteOption, UtteranceTuning, CoherenceReport } from "@/lib/types";
import type { Intent } from "@/lib/intent";
import { extractDNA } from "@/lib/linguisticDNA";
import { generateSoulMarkdown } from "@/lib/generateSoul";
import { tasteToTone } from "@/lib/tasteTest";
import { saveDraft, loadDraft, clearDraft, getSoul, commitToLibrary } from "@/lib/storage";
import { commitCloudSoul, getCloudSoul } from "@/lib/db/souls";
import { createClient } from "@/lib/supabase/client";
import { SHADOW_DYADS } from "@/lib/dyads";
import { compileHardMusts } from "@/lib/intent";

import { DesignationStep } from "@/components/DesignationStep";
import { PhaseIntent } from "@/components/PhaseIntent";
import { BranchSelect } from "@/components/BranchSelect";
import { PhaseIgnition } from "@/components/PhaseIgnition";
import { PhaseMirror } from "@/components/PhaseMirror";
import { PhaseShadow } from "@/components/PhaseShadow";
import { PhaseAnchor } from "@/components/PhaseAnchor";
import { PhaseBetrayal } from "@/components/PhaseBetrayal";
import { PhaseTasteTest } from "@/components/PhaseTasteTest";
import { PhaseUtterance } from "@/components/PhaseUtterance";
import { PhaseCommunion } from "@/components/PhaseCommunion";
import { IncrementalSoul } from "@/components/IncrementalSoul";
import { StepIndicator } from "@/components/StepIndicator";
import { FinalScreen } from "@/components/FinalScreen";
import { SummoningLoader } from "@/components/SummoningLoader";

// the forge orchestrator. everything funnels through here.
//
// the Suspense wrapper around ForgeInner is non-negotiable in Next 16
// — useSearchParams forces it. removing it gets you a build error
// that took me an hour to figure out the first time.

export default function ForgePage() {
  return (
    <Suspense fallback={null}>
      <ForgeInner />
    </Suspense>
  );
}

function ForgeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ForgeState>(INITIAL_STATE);
  const [harvesting, setHarvesting] = useState(false);
  // loadedId = the cloud/local record we're editing IN PLACE. null means
  // "saving creates a new record" — which is exactly what a fork needs.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  // when a non-owner opens a public soul, we record where it came from
  // so the UI can say "forked from @author" and saving spawns a copy
  // owned by the viewer instead of trying (and failing) to overwrite.
  const [forkedFrom, setForkedFrom] = useState<string | null>(null);
  // keep a ref so async sends read the freshest state (no stale closures)
  // stateRef exists because async fetches close over stale state. read
  // the actual current state inside callbacks via stateRef.current,
  // not via state directly. learned this the painful way when chat
  // was sending the BEFORE-the-revision soul.md to openrouter and i
  // spent a whole afternoon convinced groq was lying to me.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // mount: priority is ?cloud=<id> > ?load=<id> > in-progress draft.
  // ?cloud is for chamber-published souls; ?load is local-vault souls.
  useEffect(() => {
    const cloudId = searchParams.get("cloud");
    const loadId = searchParams.get("load");
    const targetPhase = searchParams.get("phase") as Phase | null;

    (async () => {
      if (cloudId) {
        const rec = await getCloudSoul(cloudId);
        if (rec) {
          // who is opening this? only the creator can edit in place.
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const isOwner = !!user && user.id === rec.user_id;

          // ALWAYS start communion fresh. the conversation belongs to
          // whoever is talking to the soul right now — never inherited.
          const restored: ForgeState = withFreshCommunion({
            ...rec.state_json,
            phase: targetPhase && PHASE_ORDER.includes(targetPhase) ? targetPhase : "communion",
          });

          if (isOwner) {
            // editing your own soul — save updates it in place
            setLoadedId(rec.id);
            setForkedFrom(null);
          } else {
            // someone else's soul. this is a fork: clear loadedId so a
            // save creates a NEW record owned by the viewer, never an
            // overwrite of the original. RLS would block the overwrite
            // anyway, but we make the intent explicit in the UX.
            setLoadedId(null);
            setForkedFrom(rec.id);
          }
          setState(restored);
          return;
        }
      }
      if (loadId) {
        const rec = getSoul(loadId);
        if (rec) {
          setLoadedId(rec.id);
          setForkedFrom(null);
          const restored: ForgeState = withFreshCommunion({
            ...rec.state,
            phase: targetPhase && PHASE_ORDER.includes(targetPhase) ? targetPhase : "communion",
          });
          setState(restored);
          return;
        }
      }
      const draft = loadDraft();
      if (draft && draft.phase !== "complete" && draft.phase !== "designation") {
        setState(draft);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ?fresh=1 — wipe everything and start a new build. fires on mount
  // AND on client-side query changes (Nav → /forge?fresh=1 while
  // already at /forge doesn't remount the component).
  useEffect(() => {
    if (searchParams.get("fresh") === "1") {
      clearDraft();
      setLoadedId(null);
      setState(INITIAL_STATE);
      router.replace("/forge");
    }
  }, [searchParams, router]);

  // autosave the draft on every state change (debounced via batched react updates)
  useEffect(() => {
    // don't autosave the empty initial state
    if (state.phase === "designation" && !state.designation) return;
    saveDraft(state);
  }, [state]);

  const phaseIndex = PHASE_ORDER.indexOf(state.phase);
  const totalPhases = PHASE_ORDER.length - 1; // exclude `complete`

  function advance() {
    setState((s) => {
      const i = PHASE_ORDER.indexOf(s.phase);
      const next = PHASE_ORDER[Math.min(i + 1, PHASE_ORDER.length - 1)];
      // when advancing OUT of anchor (into betrayal), fire the
      // personalization in the background so the scenario is ready
      // by the time the user lands on the taste test (~2 phases later)
      if (s.phase === "anchor") {
        void personalizeTasteIfPossible();
      }
      // running the coherence check at the tasteTest→utterance hop
      // means the result is ready by the time the operator lands in
      // communion. one groq call, ~2 seconds, in the background.
      if (s.phase === "tasteTest") {
        void runCoherenceCheck();
      }
      return { ...s, phase: next };
    });
  }
  function rewind() {
    setState((s) => {
      const i = PHASE_ORDER.indexOf(s.phase);
      const prev = PHASE_ORDER[Math.max(i - 1, 0)];
      return { ...s, phase: prev };
    });
  }

  // groq-suggested orientation. carried alongside state but not part
  // of it — the user's final picks live in state, the suggestions are
  // hints we surface in the next phase.
  const [suggestedBranch, setSuggestedBranch] = useState<Branch | null>(null);
  const [suggestedAnchors, setSuggestedAnchors] = useState<string[]>([]);
  const [personalizing, setPersonalizing] = useState(false);
  const [coherencePending, setCoherencePending] = useState(false);

  function setDesignation(v: string) { setState((s) => ({ ...s, designation: v })); }
  function setIntent(v: Intent) { setState((s) => ({ ...s, intent: v })); }
  function setBranch(b: Branch) { setState((s) => ({ ...s, branch: b })); }
  function setIgnition(v: string) { setState((s) => ({ ...s, ignition: v })); }
  function setMirror(v: string) { setState((s) => ({ ...s, mirror: v })); }
  function setShadow(id: string, c: DyadChoice) {
    setState((s) => ({ ...s, shadow: { ...s.shadow, [id]: c } }));
  }
  function setAnchorExemplar(v: string) {
    setState((s) => ({ ...s, anchor: { ...s.anchor, exemplar: v } }));
  }
  function setAnchorEssence(v: string) {
    setState((s) => ({ ...s, anchor: { ...s.anchor, essence: v } }));
  }
  function setBetrayal(v: string) { setState((s) => ({ ...s, betrayal: v })); }
  function setTasteTest(v: TasteOption) {
    setState((s) => ({ ...s, tasteTest: v, utterance: tasteToTone(v) }));
  }
  function setUtterance(t: UtteranceTuning) { setState((s) => ({ ...s, utterance: t })); }

  function jumpToPhase(p: Phase) {
    setState((s) => ({ ...s, phase: p }));
  }

  function clearChat() {
    setState((s) => ({ ...s, communion: { messages: [], pending: false, error: null } }));
  }

  async function sendCommunion(text: string) {
    const opMsg: ChatMessage = {
      id: `op-${Date.now()}`,
      role: "operator",
      text,
      ts: Date.now(),
    };
    // optimistic add + pending
    setState((s) => ({
      ...s,
      communion: {
        messages: [...s.communion.messages, opMsg],
        pending: true,
        error: null,
      },
    }));

    // snapshot the soul.md at send time, including any phase revisions
    const snapshot = generateSoulMarkdown({
      ...stateRef.current,
      communion: {
        ...stateRef.current.communion,
        messages: [...stateRef.current.communion.messages, opMsg],
      },
    });

    try {
      const res = await fetch("/api/communion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soulMd: snapshot,
          branch: stateRef.current.branch,
          messages: [...stateRef.current.communion.messages, opMsg],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState((s) => ({
          ...s,
          communion: { ...s.communion, pending: false, error: data?.error ?? "request failed" },
        }));
        return;
      }
      const soulMsg: ChatMessage = {
        id: `soul-${Date.now()}`,
        role: "soul",
        text: data.reply,
        ts: Date.now(),
      };
      setState((s) => ({
        ...s,
        communion: {
          messages: [...s.communion.messages, soulMsg],
          pending: false,
          error: null,
        },
      }));
    } catch (err: any) {
      setState((s) => ({
        ...s,
        communion: { ...s.communion, pending: false, error: err?.message ?? "network failure" },
      }));
    }
  }

  function finishMirror() {
    // derive DNA on transition out of mirror phase
    setState((s) => ({ ...s, dna: extractDNA(s.mirror), phase: "shadow" }));
  }

  // fire-and-forget personalization request. invoked when transitioning
  // out of anchor phase (which is when we finally have intent + branch
  // + DNA + anchor — everything groq needs to build a calibrated taste
  // test). result populates state; phase doesn't wait on it.
  async function personalizeTasteIfPossible() {
    const s = stateRef.current;
    if (!s.intent.mission.trim() || !s.branch || !s.dna || !s.anchor.exemplar) return;
    if (personalizing) return;
    setPersonalizing(true);
    try {
      const res = await fetch("/api/taste-personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission: s.intent.mission,
          branch: s.branch,
          dna: s.dna,
          anchor: s.anchor,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setState((cur) => ({
        ...cur,
        personalizedTaste: data as PersonalizedTaste,
      }));
    } catch {
      // silent — taste test falls back to static scenarios
    } finally {
      setPersonalizing(false);
    }
  }

  // shared patch-apply logic — used by both the contradiction fixer
  // and the live tuner. only known keys are honored; everything else
  // is silently dropped so a hallucinated patch field can't corrupt
  // state. mutates state via setState. returns void.
  function applySoulPatch(ch: any): void {
    setState((cur) => {
      let next = { ...cur };
      let intent = { ...next.intent };
      if (typeof ch.betrayal === "string") next.betrayal = ch.betrayal;
      if (typeof ch.mission === "string") intent.mission = ch.mission;
      if (ch.spice && [1, 2, 3, 4].includes(ch.spice)) intent.spice = ch.spice;
      if (Array.isArray(ch.hardMustKeys_remove)) {
        intent.hardMustKeys = intent.hardMustKeys.filter((k) => !ch.hardMustKeys_remove.includes(k));
      }
      if (Array.isArray(ch.hardMustKeys_add)) {
        const adds = ch.hardMustKeys_add.filter((k: string) => !intent.hardMustKeys.includes(k));
        intent.hardMustKeys = [...intent.hardMustKeys, ...adds];
      }
      if (Array.isArray(ch.customHardMusts_remove)) {
        intent.customHardMusts = intent.customHardMusts.filter((_, i) => !ch.customHardMusts_remove.includes(i));
      }
      if (Array.isArray(ch.customHardMusts_add)) {
        intent.customHardMusts = [
          ...intent.customHardMusts,
          ...ch.customHardMusts_add.filter((t: any) => typeof t === "string" && t.trim()),
        ];
      }
      if (ch.shadow && typeof ch.shadow === "object") {
        next.shadow = { ...next.shadow };
        for (const [id, choice] of Object.entries(ch.shadow)) {
          if (choice === "A" || choice === "B") next.shadow[id] = choice;
        }
      }
      if (typeof ch.anchor_exemplar === "string") {
        next.anchor = { ...next.anchor, exemplar: ch.anchor_exemplar };
      }
      if (typeof ch.anchor_essence === "string") {
        next.anchor = { ...next.anchor, essence: ch.anchor_essence };
      }
      next.intent = intent;
      return next;
    });
  }

  // live soul tuner — operator marks a reply as "felt off" + types
  // what was wrong. groq returns a patch. we apply it. next message
  // they send uses the tuned soul.md.
  async function applyTuneSoul(args: {
    feedback: string;
    triggeringReply: string;
    operatorMessage: string;
  }): Promise<{ note: string } | null> {
    const s = stateRef.current;
    const shadowPicks = Object.entries(s.shadow).map(([id, choice]) => {
      const dyad = SHADOW_DYADS.find((d) => d.id === id);
      if (!dyad) return null;
      return choice === "A"
        ? { id, kept: dyad.optionA, refused: dyad.optionB }
        : { id, kept: dyad.optionB, refused: dyad.optionA };
    }).filter(Boolean) as { id: string; kept: string; refused: string }[];

    const res = await fetch("/api/soul-tune", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feedback: args.feedback,
        triggeringReply: args.triggeringReply,
        operatorMessage: args.operatorMessage,
        mission: s.intent.mission,
        branch: s.branch ?? "BUILD",
        spice: s.intent.spice,
        betrayal: s.betrayal,
        hardMustKeys: s.intent.hardMustKeys,
        customHardMusts: s.intent.customHardMusts,
        shadowPicks,
        anchor: s.anchor,
        dnaSummary: s.dna ? {
          cadence: s.dna.cadence,
          profanityOk: s.dna.profanity,
          lowercase: s.dna.hasLowercaseBias,
        } : { cadence: "neutral", profanityOk: false, lowercase: false },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    applySoulPatch(data?.changes ?? {});
    return { note: typeof data?.note === "string" ? data.note : "tune applied" };
  }

  // resolve a single contradiction via groq + apply the patch in-place.
  // returns the resolver note so the banner can show "fixed: X".
  async function applyContradictionFix(c: {
    description: string;
    fields: string[];
    suggestedFix: string;
  }): Promise<{ note: string } | null> {
    const s = stateRef.current;
    const shadowPicks = Object.entries(s.shadow).map(([id, choice]) => {
      const dyad = SHADOW_DYADS.find((d) => d.id === id);
      if (!dyad) return null;
      return choice === "A"
        ? { id, kept: dyad.optionA, refused: dyad.optionB }
        : { id, kept: dyad.optionB, refused: dyad.optionA };
    }).filter(Boolean) as { id: string; kept: string; refused: string }[];

    const res = await fetch("/api/coherence-resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contradiction: {
          description: c.description,
          fields: c.fields,
          suggested_fix: c.suggestedFix,
        },
        mission: s.intent.mission,
        branch: s.branch ?? "BUILD",
        spice: s.intent.spice,
        betrayal: s.betrayal,
        hardMustKeys: s.intent.hardMustKeys,
        customHardMusts: s.intent.customHardMusts,
        shadowPicks,
        anchor: s.anchor,
        dnaSummary: s.dna ? {
          cadence: s.dna.cadence,
          profanityOk: s.dna.profanity,
          lowercase: s.dna.hasLowercaseBias,
        } : { cadence: "neutral", profanityOk: false, lowercase: false },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    applySoulPatch(data?.changes ?? {});
    // drop this contradiction from the coherence report so the banner
    // doesn't keep showing it
    setState((cur) => {
      if (!cur.coherence) return cur;
      return {
        ...cur,
        coherence: {
          ...cur.coherence,
          contradictions: cur.coherence.contradictions.filter(
            (cc) => cc.description !== c.description,
          ),
        },
      };
    });
    return { note: typeof data?.note === "string" ? data.note : "applied minimal fix" };
  }

  // coherence audit. called right before complete() runs. blocking so
  // we can show contradictions before the user commits to compile.
  async function runCoherenceCheck(): Promise<void> {
    const s = stateRef.current;
    setCoherencePending(true);
    try {
      const shadowPicks = Object.entries(s.shadow).map(([id, choice]) => {
        const dyad = SHADOW_DYADS.find((d) => d.id === id);
        if (!dyad) return null;
        return choice === "A"
          ? { kept: dyad.optionA, refused: dyad.optionB }
          : { kept: dyad.optionB, refused: dyad.optionA };
      }).filter(Boolean) as { kept: string; refused: string }[];

      const hardMusts = compileHardMusts(s.intent);

      const res = await fetch("/api/coherence-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission: s.intent.mission,
          branch: s.branch,
          spice: s.intent.spice,
          ignition: s.ignition,
          dna: s.dna,
          shadowPicks,
          anchor: s.anchor,
          betrayal: s.betrayal,
          tasteLabel: s.tasteTest ?? "",
          hardMusts,
        }),
      });
      if (!res.ok) {
        setState((cur) => ({ ...cur, coherence: { allClear: true, contradictions: [], checkedAt: Date.now() } }));
        return;
      }
      const data = await res.json();
      setState((cur) => ({
        ...cur,
        coherence: {
          allClear: !!data.all_clear,
          contradictions: Array.isArray(data.contradictions)
            ? data.contradictions.map((c: any) => ({
                description: c.description ?? "",
                fields: Array.isArray(c.fields) ? c.fields : [],
                suggestedFix: c.suggested_fix ?? "",
              }))
            : [],
          checkedAt: Date.now(),
        },
      }));
    } catch {
      setState((cur) => ({ ...cur, coherence: { allClear: true, contradictions: [], checkedAt: Date.now() } }));
    } finally {
      setCoherencePending(false);
    }
  }

  async function complete() {
    setHarvesting(true);
    await new Promise((r) => setTimeout(r, 2200));
    setHarvesting(false);
    const finalState: ForgeState = { ...stateRef.current, phase: "complete" };
    const finalSoulMd = generateSoulMarkdown(finalState);

    // if signed in, commit to cloud (and use the cloud id going forward).
    // if not, fall back to the localStorage library.
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let nextLoadedId = loadedId;
    if (user) {
      // is the loadedId a cloud uuid? if yes, update in place; if no
      // (it's a local-storage id), create a new cloud record.
      const looksLikeCloudId = loadedId && /^[0-9a-f-]{36}$/.test(loadedId);
      const cloudRec = await commitCloudSoul(finalState, finalSoulMd, {
        id: looksLikeCloudId ? loadedId! : undefined,
      });
      if (cloudRec) nextLoadedId = cloudRec.id;
    } else {
      const rec = commitToLibrary(finalState, loadedId ?? undefined);
      nextLoadedId = rec.id;
    }

    setLoadedId(nextLoadedId);
    setState(finalState);

    if (searchParams.get("load") || searchParams.get("phase") || searchParams.get("cloud")) {
      router.replace("/forge");
    }
  }

  // publish the current soul to the public Chamber. only valid after
  // complete() has committed it. used by FinalScreen.
  async function publishCurrentSoul(): Promise<{ ok: boolean; error?: string }> {
    if (!loadedId) return { ok: false, error: "soul not saved yet" };
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "sign in to publish" };

    // make sure it's a cloud record — if it's a localStorage one we
    // can't publish (no DB row exists).
    const looksLikeCloudId = /^[0-9a-f-]{36}$/.test(loadedId);
    if (!looksLikeCloudId) return { ok: false, error: "this soul was forged before you signed in. re-forge to publish." };

    // spice-4 souls can't be public — DB trigger will silently reset
    // them to private if we try, so we surface the rejection here
    // instead of pretending to succeed.
    const spice = stateRef.current.intent?.spice ?? 1;
    if (spice >= 4) {
      return { ok: false, error: "spice 4 souls cannot be published. they live in your private vault only by design." };
    }

    const { error } = await supabase
      .from("souls")
      .update({ visibility: "public" })
      .eq("id", loadedId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  function reset() {
    clearDraft();
    setLoadedId(null);
    setForkedFrom(null);
    setState(INITIAL_STATE);
    if (searchParams.get("load") || searchParams.get("phase") || searchParams.get("cloud")) {
      router.replace("/forge");
    }
  }

  // re-enter communion from the final screen — drops the chat history
  // by default so the user can start a fresh test on the same soul.
  function reenterCommunion() {
    setState((s) => ({
      ...s,
      phase: "communion",
      communion: { messages: [], pending: false, error: null },
    }));
  }

  const soulMd = useMemo(() => generateSoulMarkdown(state), [state]);

  if (state.phase === "complete") {
    return (
      <FinalScreen
        soulMd={soulMd}
        designation={state.designation || "UNNAMED"}
        onReset={reset}
        onReenterCommunion={reenterCommunion}
        onPublish={publishCurrentSoul}
        soulId={loadedId}
        isFork={!!forkedFrom}
      />
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
      {harvesting && <SummoningLoader variant="overlay" intervalMs={700} />}
      <div className="mb-4 sm:mb-6">
        <StepIndicator current={phaseIndex + 1} total={totalPhases} />
      </div>

      <div className="grid gap-3 sm:gap-6 lg:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPhase(state, {
              setDesignation, setIntent, setBranch, setIgnition, setMirror,
              setShadow, setAnchorExemplar, setAnchorEssence,
              setBetrayal, setTasteTest, setUtterance,
              setSuggestedBranch, setSuggestedAnchors,
              advance, rewind, finishMirror, complete,
              sendCommunion, jumpToPhase, clearChat,
              applyContradictionFix,
              applyTuneSoul,
              soulMd,
            }, {
              suggestedBranch,
              suggestedAnchors,
            })}
          </motion.div>
        </AnimatePresence>

        <IncrementalSoul state={state} />
      </div>
    </div>
  );
}

type Handlers = {
  setDesignation: (v: string) => void;
  setIntent: (v: Intent) => void;
  setBranch: (b: Branch) => void;
  setIgnition: (v: string) => void;
  setMirror: (v: string) => void;
  setShadow: (id: string, c: DyadChoice) => void;
  setAnchorExemplar: (v: string) => void;
  setAnchorEssence: (v: string) => void;
  setBetrayal: (v: string) => void;
  setTasteTest: (v: TasteOption) => void;
  setUtterance: (t: UtteranceTuning) => void;
  setSuggestedBranch: (b: Branch) => void;
  setSuggestedAnchors: (a: string[]) => void;
  advance: () => void;
  rewind: () => void;
  finishMirror: () => void;
  complete: () => Promise<void>;
  sendCommunion: (text: string) => Promise<void>;
  jumpToPhase: (p: Phase) => void;
  clearChat: () => void;
  applyContradictionFix: (c: { description: string; fields: string[]; suggestedFix: string }) => Promise<{ note: string } | null>;
  applyTuneSoul: (args: { feedback: string; triggeringReply: string; operatorMessage: string }) => Promise<{ note: string } | null>;
  soulMd: string;
};

type RenderExtras = {
  suggestedBranch: Branch | null;
  suggestedAnchors: string[];
};

function renderPhase(s: ForgeState, h: Handlers, extras?: RenderExtras) {
  switch (s.phase) {
    case "designation":
      return (
        <DesignationStep
          value={s.designation}
          onChange={h.setDesignation}
          onNext={h.advance}
        />
      );
    case "intent":
      return (
        <PhaseIntent
          designation={s.designation}
          value={s.intent}
          onChange={h.setIntent}
          onSuggestBranch={h.setSuggestedBranch}
          onSuggestAnchors={h.setSuggestedAnchors}
          onBack={h.rewind}
          onNext={h.advance}
        />
      );
    case "branch":
      return (
        <BranchSelect
          designation={s.designation}
          value={s.branch}
          suggestion={extras?.suggestedBranch ?? null}
          onChange={h.setBranch}
          onBack={h.rewind}
          onNext={h.advance}
        />
      );
    case "ignition":
      return (
        <PhaseIgnition
          designation={s.designation}
          value={s.ignition}
          onChange={h.setIgnition}
          onBack={h.rewind}
          onNext={h.advance}
        />
      );
    case "mirror":
      return (
        <PhaseMirror
          value={s.mirror}
          onChange={h.setMirror}
          onBack={h.rewind}
          onNext={h.finishMirror}
        />
      );
    case "shadow":
      return (
        <PhaseShadow
          choices={s.shadow}
          onChange={h.setShadow}
          onBack={h.rewind}
          onNext={h.advance}
        />
      );
    case "anchor":
      return (
        <PhaseAnchor
          exemplar={s.anchor.exemplar}
          essence={s.anchor.essence}
          suggestions={extras?.suggestedAnchors}
          onExemplar={h.setAnchorExemplar}
          onEssence={h.setAnchorEssence}
          onBack={h.rewind}
          onNext={h.advance}
        />
      );
    case "betrayal":
      return (
        <PhaseBetrayal
          designation={s.designation}
          value={s.betrayal}
          onChange={h.setBetrayal}
          onBack={h.rewind}
          onNext={h.advance}
        />
      );
    case "tasteTest":
      return (
        <PhaseTasteTest
          branch={s.branch ?? "BUILD"}
          value={s.tasteTest}
          personalized={s.personalizedTaste}
          onChange={h.setTasteTest}
          onBack={h.rewind}
          onNext={h.advance}
        />
      );
    case "utterance":
      return (
        <PhaseUtterance
          designation={s.designation}
          branch={s.branch ?? "BUILD"}
          tuning={s.utterance}
          onChange={h.setUtterance}
          onBack={h.rewind}
          onNext={h.advance}
        />
      );
    case "communion":
      return (
        <PhaseCommunion
          designation={s.designation}
          branch={s.branch ?? "BUILD"}
          soulMd={h.soulMd}
          messages={s.communion.messages}
          pending={s.communion.pending}
          error={s.communion.error}
          coherence={s.coherence}
          onSend={h.sendCommunion}
          onJumpTo={h.jumpToPhase}
          onBack={h.rewind}
          onFinalize={h.complete}
          onClear={h.clearChat}
          onFixContradiction={h.applyContradictionFix}
          onTuneSoul={h.applyTuneSoul}
        />
      );
    default:
      return null;
  }
}
