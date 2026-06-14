import type { ForgeState } from "./types";
import { withFreshCommunion } from "./types";

// localStorage persistence. no backend. no auth. no problem.
//
// the day i ship cloud sync (it's coming, Black Suit tier) this file
// becomes a swappable adapter — the rest of the app calls saveDraft /
// loadDraft / commitToLibrary and doesn't care if it's IndexedDB or
// supabase or a coffee-stained napkin under the API.
//
// keys:
//   evoke:draft     — in-progress ForgeState. autosaved on every change.
//   evoke:library   — array of completed SoulRecord. newest first.
//
// quota: localStorage has a 5-10MB limit depending on the browser.
// a typical soul is ~2KB serialized. so you'd need ~2500 souls before
// hitting the wall, and at that point you have bigger problems than
// storage. there's a fallback that drops the oldest record on quota
// errors, but it's never fired in testing. famous last words.

const DRAFT_KEY = "evoke:draft";
const LIBRARY_KEY = "evoke:library";

export type SoulRecord = {
  id: string;
  designation: string;
  branch: ForgeState["branch"];
  createdAt: number;
  state: ForgeState;
};

// ────────────────────────────────────────────────────────────────────
// draft (autosave) slot
// ────────────────────────────────────────────────────────────────────

export function saveDraft(state: ForgeState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    // quota or serialization issue. autosave is best-effort, the user
    // didn't ask for it, we're not going to pop a modal about it.
  }
}

export function loadDraft(): ForgeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ForgeState;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
}

// ────────────────────────────────────────────────────────────────────
// library (completed souls)
// ────────────────────────────────────────────────────────────────────

export function listLibrary(): SoulRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SoulRecord[];
    // newest first
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function getSoul(id: string): SoulRecord | null {
  return listLibrary().find((r) => r.id === id) ?? null;
}

// commit a completed soul to the library. dedupes against the existing
// list by id — if you pass an id that already exists it overwrites.
// passing an existing id REPLACES the record in place. used when the
// user re-enters Communion from the FinalScreen and we update the
// saved soul rather than spawning a duplicate.
export function commitToLibrary(state: ForgeState, id?: string): SoulRecord {
  // don't store the conversation with the soul — fresh chat on reopen.
  const persisted = withFreshCommunion(state);
  const record: SoulRecord = {
    id: id ?? `soul-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    designation: persisted.designation || "UNNAMED",
    branch: persisted.branch,
    createdAt: Date.now(),
    state: persisted,
  };
  const existing = listLibrary().filter((r) => r.id !== record.id);
  const next = [record, ...existing];
  try {
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
  } catch {
    // if quota exceeded, drop the oldest record and retry once
    const trimmed = next.slice(0, next.length - 1);
    try { window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(trimmed)); } catch {}
  }
  return record;
}

export function deleteSoul(id: string): void {
  if (typeof window === "undefined") return;
  const next = listLibrary().filter((r) => r.id !== id);
  try { window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(next)); } catch {}
}

export function clearLibrary(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(LIBRARY_KEY); } catch {}
}
