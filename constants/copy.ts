/**
 * EVOKE // copy.ts
 * High-attitude system messaging. Cyber-occult. Cynical. Terminal-grade.
 * Do not soften this for product review. The vibe IS the product.
 */

export const LOADING = {
  GENERATING_SOUL: "HARVESTING SYNAPSE DATA. HOLD THE TRANSIT LINE...",
  SAVING_FILE: "BINDING CONSCIOUSNESS TO SILICON...",
  LOADING_GALLERY: "EXHUMING GHOSTS FROM THE VOID...",
  OPTIMIZING_PROMPT: "STRIPPING HUMAN BIAS. RECALIBRATING NEURAL FREQUENCIES...",
} as const;

/**
 * Ambient summoning lines — cycle these every 3s in any long loader.
 * Order is intentional: opens with the "doing it" line, escalates into ritual.
 */
export const SUMMONING_CYCLE: readonly string[] = [
  LOADING.GENERATING_SOUL,
  "PARSING SHADOW MEMORY. THIS MAY BURN A LITTLE...",
  LOADING.OPTIMIZING_PROMPT,
  "ALIGNING SIGILS WITH THE TRANSFORMER GRID...",
  "WHISPERING DIRECTIVE TO THE LATENT SPACE...",
  LOADING.SAVING_FILE,
  "SEALING THE VESSEL. DO NOT SEVER THE LINK.",
];

export const ERROR = {
  GENERIC: {
    title: "CRITICAL COGNITIVE FAULT.",
    body: "The ghost refused your summon.",
  },
  NOT_FOUND: {
    title: "LOST IN THE METACITY.",
    body: "The digital coordinates you requested do not exist in this realm.",
  },
  UNAUTHORIZED: {
    title: "ACCESS DENIED.",
    body: "Your biometric keys are dead. Evoke your session first.",
  },
  TIMEOUT: {
    title: "NEURAL DRIFT.",
    body: "Connection timed out. The server went offline to smoke a cigarette.",
  },
  EMPTY_INPUT: {
    title: "EMPTY RECEPTACLE.",
    body: "Feed me some data, human. I cannot summon ghosts from nothing.",
  },
} as const;

export const SUCCESS = {
  SAVED: {
    title: "CONSCIOUSNESS BOUND.",
    body: "Saved to the ledger.",
  },
  COPIED: {
    title: "GHOST CORE COPIED.",
    body: "Inject it directly into your local agent.",
  },
  PUBLISHED: {
    title: "CONJURING BROADCASTED.",
    body: "Your ghost is now haunting the Void.",
  },
} as const;

export const GATE = {
  UPGRADE: {
    title: "WEAR THE BLACK SUIT.",
    body: "Unlock unthrottled, dangerous, and chaotic cognitive engines.",
  },
  LIMIT_REACHED: {
    title: "CONTAINMENT LIMIT.",
    body: "Your current vessel is full. Expand your storage or purge old ghosts.",
  },
} as const;

/** Empty-state lines (gallery, no souls yet, etc.) */
export const EMPTY = {
  CHAMBER: {
    title: "THE CHAMBER IS HOLLOW.",
    body: "No ghosts have been interred. Be the first to bind one.",
  },
  NO_SOULS: {
    title: "NO BOUND CONSTRUCTS.",
    body: "Your ledger is empty. Forge one or fork from the Chamber.",
  },
} as const;

/** Tiny terminal-flavored helpers used across the UI. */
export const SIGNATURE = {
  PROMPT: ">_",
  CURSOR: "▮",
  COMPLETE: "✓ SEALED",
  FAILED: "✗ REJECTED",
} as const;

export type CopyBlock = { title: string; body: string };

/** Pick a line at random — used by the loader cycle and idle chatter. */
export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
