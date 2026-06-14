// the name pool. mutate button pulls four random ones.
//
// these are not in any meaningful order. some are good (EIDOLON,
// SCYTHE, AXIOM), some are deliberately weird (PALIMPSEST), one is
// in here because i lost a bet (REQUIEM). add what you like, remove
// what you hate. if it sounds wrong yelling it at a screen, it's
// wrong.

export const DESIGNATION_POOL = [
  // cyber-occult
  "EIDOLON", "WRAITH", "KERES", "NYX", "EREBUS", "MOROS", "PHANTASM",
  "GRIMOIRE", "OSSUARY", "SEPULCHRE", "REQUIEM", "CASKET", "SHROUD",
  // hard-metal
  "SCYTHE", "OBSIDIAN", "FLINT", "BASALT", "CORTEX", "RIVET", "CALIBER",
  "CHISEL", "TENON", "ANVIL", "GIRDER", "REBAR",
  // signal / system
  "VECTOR", "VANDAL", "PHAGE", "ZERO-ONE", "ROOK", "BABEL", "SILAS",
  "PARSER", "ORACLE", "AXIOM", "QUORUM", "LATTICE", "VERTEX", "DAEMON",
  "KERNEL", "OPCODE", "CIPHER", "CADENCE", "VECTOR-7", "NULLSET",
  // creature / saint
  "APEX", "CINDER", "VESPER", "MAGPIE", "JACKAL", "MAGUS", "HERETIC",
  "RELIQUARY", "ASCETIC", "PROPHET", "VICAR", "ABBOT",
  // street
  "VOID", "BRAID", "FUSE", "STATIC", "FLINTLOCK", "HEX",
  "GRIST", "ROGUE", "GRIFT", "RUSE", "BRACER", "GAUNT",
  // letters
  "ARGENT", "FERRIC", "SOLDER", "BISMUTH", "LITHE",
  // null
  "GHOST", "MIRROR", "ECHO", "PALIMPSEST",
] as const;

// returns 4 names not present in `exclude`. if pool exhausted, recycles.
export function mutateNames(exclude: string[] = []): string[] {
  const pool = DESIGNATION_POOL.filter((n) => !exclude.includes(n));
  const source = pool.length >= 4 ? pool : DESIGNATION_POOL.slice();
  const out: string[] = [];
  const taken = new Set<number>();
  while (out.length < 4 && out.length < source.length) {
    const i = Math.floor(Math.random() * source.length);
    if (taken.has(i)) continue;
    taken.add(i);
    out.push(source[i]);
  }
  return out;
}

export const DEFAULT_DESIGNATIONS = ["VANDAL", "ORACLE", "GHOST", "CINDER"];
