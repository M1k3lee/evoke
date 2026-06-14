"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { INITIAL_STATE, PHASE_ORDER } from "@/lib/types";
import type { Branch, ChatMessage, DyadChoice, ForgeState, Phase, TasteOption, UtteranceTuning } from "@/lib/types";
import { extractDNA } from "@/lib/linguisticDNA";
import { generateSoulMarkdown } from "@/lib/generateSoul";
import { tasteToTone } from "@/lib/tasteTest";
import { saveDraft, loadDraft, clearDraft, getSoul, commitToLibrary } from "@/lib/storage";
import { commitCloudSoul, getCloudSoul } from "@/lib/db/souls";
import { createClient } from "@/lib/supabase/client";

import { DesignationStep } from "@/components/DesignationStep";
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
  const [loadedId, setLoadedId] = useState<string | null>(null);
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
          setLoadedId(rec.id);
          const restored: ForgeState = {
            ...rec.state_json,
            phase: targetPhase && PHASE_ORDER.includes(targetPhase) ? targetPhase : "communion",
          };
          setState(restored);
          return;
        }
      }
      if (loadId) {
        const rec = getSoul(loadId);
        if (rec) {
          setLoadedId(rec.id);
          const restored: ForgeState = {
            ...rec.state,
            phase: targetPhase && PHASE_ORDER.includes(targetPhase) ? targetPhase : "communion",
          };
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

  function setDesignation(v: string) { setState((s) => ({ ...s, designation: v })); }
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
    setState(INITIAL_STATE);
    if (searchParams.get("load") || searchParams.get("phase")) {
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
      />
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-6 py-8">
      {harvesting && <SummoningLoader variant="overlay" intervalMs={700} />}
      <div className="mb-6">
        <StepIndicator current={phaseIndex + 1} total={totalPhases} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPhase(state, {
              setDesignation, setBranch, setIgnition, setMirror,
              setShadow, setAnchorExemplar, setAnchorEssence,
              setBetrayal, setTasteTest, setUtterance,
              advance, rewind, finishMirror, complete,
              sendCommunion, jumpToPhase, clearChat,
              soulMd,
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
  setBranch: (b: Branch) => void;
  setIgnition: (v: string) => void;
  setMirror: (v: string) => void;
  setShadow: (id: string, c: DyadChoice) => void;
  setAnchorExemplar: (v: string) => void;
  setAnchorEssence: (v: string) => void;
  setBetrayal: (v: string) => void;
  setTasteTest: (v: TasteOption) => void;
  setUtterance: (t: UtteranceTuning) => void;
  advance: () => void;
  rewind: () => void;
  finishMirror: () => void;
  complete: () => Promise<void>;
  sendCommunion: (text: string) => Promise<void>;
  jumpToPhase: (p: Phase) => void;
  clearChat: () => void;
  soulMd: string;
};

function renderPhase(s: ForgeState, h: Handlers) {
  switch (s.phase) {
    case "designation":
      return (
        <DesignationStep
          value={s.designation}
          onChange={h.setDesignation}
          onNext={h.advance}
        />
      );
    case "branch":
      return (
        <BranchSelect
          designation={s.designation}
          value={s.branch}
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
          onSend={h.sendCommunion}
          onJumpTo={h.jumpToPhase}
          onBack={h.rewind}
          onFinalize={h.complete}
          onClear={h.clearChat}
        />
      );
    default:
      return null;
  }
}
