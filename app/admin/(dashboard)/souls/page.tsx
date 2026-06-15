"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Skull, Search, Loader2, ShieldOff, Globe, Lock,
  ChevronLeft, ChevronRight, Flag, CheckCircle, Eye, X,
  AlertTriangle, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Soul = {
  id: string;
  designation: string;
  branch: string;
  visibility: string;
  flag_count: number;
  moderation_status: string | null;
  mission: string | null;
  spice_level: number;
  upvote_count: number;
  created_at: string;
  profiles: { username: string } | null;
};

type SoulDetail = Soul & {
  soul_md: string;
  updated_at: string;
  profiles: { username: string; display_name: string | null } | null;
  soul_reports: Array<{
    id: string;
    reason: string;
    details: string | null;
    created_at: string;
    reporter: { username: string } | null;
  }>;
};

const FILTERS = [
  { value: "all",     label: "All" },
  { value: "public",  label: "Public" },
  { value: "flagged", label: "Flagged" },
  { value: "removed", label: "Removed" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

const BRANCH_COLOR: Record<string, string> = {
  BUILD:  "text-cyan border-cyan/40",
  BOND:   "text-acid border-acid/40",
  BYPASS: "text-yellow-400 border-yellow-400/40",
  BREACH: "text-red-400 border-red-400/40",
};

const REASON_LABEL: Record<string, string> = {
  illegal_content: "Illegal content",
  child_safety: "Child safety",
  hate_speech: "Hate speech",
  harassment: "Harassment",
  graphic_violence: "Graphic violence",
  spam_scam: "Spam / scam",
  impersonation: "Impersonation",
  other: "Other",
};

function SoulDetailModal({
  soulId,
  onClose,
  onRemove,
}: {
  soulId: string;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const [soul, setSoul] = useState<SoulDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/souls/${soulId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setSoul(d.soul);
        setLoading(false);
      })
      .catch(() => { setError("failed to load soul"); setLoading(false); });
  }, [soulId]);

  async function copyMd() {
    if (!soul) return;
    await navigator.clipboard.writeText(soul.soul_md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRemove() {
    if (!soul || removing) return;
    if (!confirm(`Force "${soul.designation}" to private and mark it removed?`)) return;
    setRemoving(true);
    await fetch("/api/admin/souls", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soulId: soul.id }),
    });
    onRemove(soul.id);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative flex h-full w-full max-w-2xl flex-col border-l border-neutral-800 bg-neutral-950 overflow-hidden"
        >
          {/* header */}
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-900 px-6 py-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              <Skull className="h-3 w-3" />
              soul inspector
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-200"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {loading && (
              <div className="flex items-center gap-2 pt-12 font-mono text-xs text-neutral-600">
                <Loader2 className="h-4 w-4 animate-spin" /> loading…
              </div>
            )}
            {error && (
              <p className="pt-12 font-mono text-xs text-red-400">&gt; {error}</p>
            )}
            {soul && (
              <>
                {/* meta */}
                <div>
                  <h2 className="font-display text-4xl font-extrabold uppercase tracking-tighter">
                    {soul.designation}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className={cn("border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest", BRANCH_COLOR[soul.branch] ?? "text-neutral-500 border-neutral-800")}>
                      {soul.branch}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                      spice {soul.spice_level}
                    </span>
                    <span className={cn("flex items-center gap-1 font-mono text-[10px]", soul.visibility === "public" ? "text-acid" : "text-neutral-600")}>
                      {soul.visibility === "public" ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {soul.visibility}
                    </span>
                    {soul.flag_count > 0 && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-yellow-400">
                        <Flag className="h-3 w-3" />
                        {soul.flag_count} flag{soul.flag_count !== 1 ? "s" : ""}
                      </span>
                    )}
                    {soul.moderation_status === "removed" && (
                      <span className="font-mono text-[10px] text-red-500">removed</span>
                    )}
                  </div>
                  <div className="mt-2 font-mono text-xs text-neutral-500">
                    by @{soul.profiles?.username ?? "unknown"}
                    {soul.profiles?.display_name ? ` (${soul.profiles.display_name})` : ""}
                    <span className="mx-2 text-neutral-700">·</span>
                    {new Date(soul.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  {soul.mission && (
                    <p className="mt-3 font-mono text-xs text-neutral-400">
                      <span className="text-neutral-600">&gt; mission: </span>
                      {soul.mission}
                    </p>
                  )}
                </div>

                {/* reports (if any) */}
                {soul.soul_reports.length > 0 && (
                  <div className="mt-6">
                    <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-400">
                      <AlertTriangle className="h-3 w-3" />
                      {soul.soul_reports.length} report{soul.soul_reports.length !== 1 ? "s" : ""}
                    </h3>
                    <div className="mt-2 flex flex-col gap-2">
                      {soul.soul_reports.map((r) => (
                        <div key={r.id} className="flex items-start gap-3 border border-neutral-900 bg-black/20 px-3 py-2">
                          <span className="mt-0.5 shrink-0 border border-orange-900 bg-orange-950/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-orange-400">
                            {REASON_LABEL[r.reason] ?? r.reason}
                          </span>
                          <div className="min-w-0">
                            {r.details && (
                              <p className="font-mono text-[11px] text-neutral-400">{r.details}</p>
                            )}
                            <p className="font-mono text-[9px] text-neutral-600">
                              @{r.reporter?.username ?? "anon"} · {new Date(r.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* soul_md */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                      soul.md — system prompt
                    </h3>
                    <button
                      onClick={copyMd}
                      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 hover:text-acid"
                    >
                      {copied ? <Check className="h-3 w-3 text-acid" /> : <Copy className="h-3 w-3" />}
                      {copied ? "copied" : "copy"}
                    </button>
                  </div>
                  <pre className="mt-2 overflow-auto rounded-none border border-neutral-800 bg-black/50 p-4 font-mono text-[11px] leading-relaxed text-neutral-300 whitespace-pre-wrap break-words">
                    {soul.soul_md}
                  </pre>
                </div>
              </>
            )}
          </div>

          {/* footer actions */}
          {soul && (
            <div className="shrink-0 border-t border-neutral-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-600">
                  id: {soul.id.slice(0, 8)}…
                </span>
                {soul.moderation_status !== "removed" ? (
                  <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="flex items-center gap-2 border border-red-800 bg-red-950/30 px-4 py-2 font-mono text-xs uppercase tracking-widest text-red-400 hover:bg-red-800/40 disabled:cursor-wait disabled:opacity-60"
                  >
                    {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldOff className="h-3 w-3" />}
                    remove from public
                  </button>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-red-500">
                    already removed
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function SoulsPage() {
  const [souls, setSouls] = useState<Soul[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [viewingId, setViewingId] = useState<string | null>(null);
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), filter });
    if (query) params.set("q", query);
    const res = await fetch(`/api/admin/souls?${params}`);
    const data = await res.json();
    setSouls(data.souls ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filter, query]);

  useEffect(() => { load(); }, [load]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setQuery(search);
  }

  async function removeSoul(id: string) {
    if (!confirm("Force this soul to private and mark it removed?")) return;
    setRemoving((p) => ({ ...p, [id]: true }));
    await fetch("/api/admin/souls", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soulId: id }),
    });
    setSouls((p) =>
      p.map((s) => s.id === id ? { ...s, visibility: "private", moderation_status: "removed" } : s)
    );
    setRemoving((p) => ({ ...p, [id]: false }));
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <Skull className="h-3 w-3" />
        soul browser
      </div>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
        All Souls<span className="text-acid">.</span>
      </h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        &gt; {total.toLocaleString()} total across the network
      </p>

      {/* toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-0">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(0); }}
              className={cn(
                "border border-r-0 px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors last:border-r",
                filter === f.value
                  ? "border-acid bg-acid/10 text-acid"
                  : "border-neutral-800 text-neutral-500 hover:text-neutral-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSearch} className="flex items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search designation…"
            className="w-48 border border-neutral-800 bg-transparent px-3 py-2 font-mono text-xs text-neutral-300 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
          />
          <button
            type="submit"
            className="border border-l-0 border-neutral-800 px-3 py-2 text-neutral-500 hover:text-neutral-200"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-800">
              {["designation", "owner", "branch", "vis", "spice", "flags", "votes", "status", ""].map((h) => (
                <th
                  key={h}
                  className="py-3 pr-4 font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-neutral-600" />
                </td>
              </tr>
            ) : souls.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center font-mono text-xs text-neutral-600">
                  no souls found
                </td>
              </tr>
            ) : (
              souls.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  className="border-b border-neutral-900 transition-colors hover:bg-neutral-900/40"
                >
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => setViewingId(s.id)}
                      className="font-display text-sm font-extrabold uppercase tracking-tighter text-neutral-200 hover:text-acid"
                    >
                      {s.designation}
                    </button>
                  </td>
                  <td className="py-3 pr-4 font-mono text-[11px] text-neutral-500">
                    @{s.profiles?.username ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn("border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest", BRANCH_COLOR[s.branch] ?? "text-neutral-500 border-neutral-800")}>
                      {s.branch}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {s.visibility === "public" ? (
                      <Globe className="h-3.5 w-3.5 text-acid" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-neutral-600" />
                    )}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-neutral-500">
                    {s.spice_level}
                  </td>
                  <td className="py-3 pr-4">
                    {s.flag_count > 0 ? (
                      <div className="flex items-center gap-1 font-mono text-xs text-yellow-400">
                        <Flag className="h-3 w-3" />
                        {s.flag_count}
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-neutral-700">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-neutral-500">
                    {s.upvote_count}
                  </td>
                  <td className="py-3 pr-4">
                    {s.moderation_status === "removed" ? (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-red-500">removed</span>
                    ) : s.moderation_status === "cleared" ? (
                      <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-acid">
                        <CheckCircle className="h-3 w-3" /> cleared
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingId(s.id)}
                        className="flex items-center gap-1 border border-neutral-800 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500 hover:border-acid hover:text-acid"
                        title="View soul"
                      >
                        <Eye className="h-3 w-3" />
                        view
                      </button>
                      {s.moderation_status !== "removed" && (
                        <button
                          onClick={() => removeSoul(s.id)}
                          disabled={removing[s.id]}
                          className="flex items-center gap-1 border border-neutral-800 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500 hover:border-red-800 hover:text-red-400 disabled:cursor-wait"
                          title="Force remove"
                        >
                          {removing[s.id] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ShieldOff className="h-3 w-3" />
                          )}
                          remove
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="border border-neutral-800 p-2 text-neutral-500 hover:text-neutral-200 disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-xs text-neutral-500">
            page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="border border-neutral-800 p-2 text-neutral-500 hover:text-neutral-200 disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* soul detail slide-out */}
      {viewingId && (
        <SoulDetailModal
          soulId={viewingId}
          onClose={() => setViewingId(null)}
          onRemove={(id) => {
            setSouls((p) =>
              p.map((s) => s.id === id ? { ...s, visibility: "private", moderation_status: "removed" } : s)
            );
          }}
        />
      )}
    </div>
  );
}
