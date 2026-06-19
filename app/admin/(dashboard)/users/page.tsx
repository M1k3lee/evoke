"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Download, Search, Loader2, Skull, ChevronLeft, ChevronRight, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";

type User = {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  soul_count: number;
  created_at: string;
  sanctioned: boolean;
  sanctioned_bmac_email: string | null;
  sanctioned_claimed_at: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("q", query);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setTotal(data.total ?? 0);
    setSelected(new Set());
    setLoading(false);
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setQuery(search);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function toggleSanctioned(userId: string, current: boolean) {
    setTogglingId(userId);
    // optimistic update
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, sanctioned: !current } : u));
    const res = await fetch("/api/admin/sanctioned", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, grant: !current }),
    });
    if (!res.ok) {
      // revert
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, sanctioned: current } : u));
    }
    setTogglingId(null);
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === users.length ? new Set() : new Set(users.map((u) => u.id))
    );
  }

  function exportSelectedEmails() {
    const emails = users
      .filter((u) => selected.has(u.id) && u.email)
      .map((u) => u.email!)
      .join("\n");
    const blob = new Blob([emails], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected-emails.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportAllCsv() {
    setExporting(true);
    const params = new URLSearchParams({ export: "csv" });
    if (query) params.set("q", query);
    const res = await fetch(`/api/admin/users?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const cd = res.headers.get("content-disposition") ?? "";
    const match = cd.match(/filename="([^"]+)"/);
    a.download = match?.[1] ?? "evoke-users.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <Users className="h-3 w-3" />
        user management
      </div>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
        Users<span className="text-acid">.</span>
      </h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        &gt; {total.toLocaleString()} registered accounts
      </p>

      {/* toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={onSearch} className="flex items-center gap-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search username…"
            className="w-52 border border-neutral-800 bg-transparent px-3 py-2 font-mono text-xs text-neutral-300 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
          />
          <button
            type="submit"
            className="border border-l-0 border-neutral-800 px-3 py-2 text-neutral-500 hover:text-neutral-200"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        <button
          onClick={exportAllCsv}
          disabled={exporting}
          className="flex items-center gap-2 border border-neutral-700 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neutral-400 hover:border-acid hover:text-acid disabled:cursor-wait"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          export all csv
        </button>

        {selected.size > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={exportSelectedEmails}
            className="flex items-center gap-2 border border-acid bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
          >
            <Download className="h-3.5 w-3.5" />
            export {selected.size} emails
          </motion.button>
        )}
      </div>

      {/* table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="py-3 pr-4">
                <input
                  type="checkbox"
                  checked={selected.size === users.length && users.length > 0}
                  onChange={toggleAll}
                  className="cursor-pointer accent-[#00FF66]"
                />
              </th>
              {["username", "email", "display name", "status", "souls", "joined"].map((h) => (
                <th
                  key={h}
                  className="py-3 pr-6 font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-neutral-600" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center font-mono text-xs text-neutral-600">
                  no users found
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    "border-b border-neutral-900 transition-colors hover:bg-neutral-900/40",
                    selected.has(u.id) && "bg-acid/5"
                  )}
                >
                  <td className="py-3 pr-4">
                    <input
                      type="checkbox"
                      checked={selected.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      className="cursor-pointer accent-[#00FF66]"
                    />
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs text-neutral-200">
                    @{u.username}
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs text-neutral-400">
                    {u.email ?? <span className="text-neutral-700">—</span>}
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs text-neutral-500">
                    {u.display_name ?? <span className="text-neutral-700">—</span>}
                  </td>
                  <td className="py-3 pr-6">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleSanctioned(u.id, u.sanctioned)}
                        disabled={togglingId === u.id}
                        title={u.sanctioned ? "Revoke [SANCTIONED]" : "Grant [SANCTIONED]"}
                        className={cn(
                          "flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                          u.sanctioned
                            ? "border-acid/60 text-acid hover:border-red-500/60 hover:text-red-400"
                            : "border-neutral-800 text-neutral-600 hover:border-acid/60 hover:text-acid",
                        )}
                      >
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {u.sanctioned ? "[S]" : "grant"}
                      </button>
                      {!u.sanctioned && u.sanctioned_claimed_at && (
                        <div
                          className="font-mono text-[9px] text-yellow-500/70"
                          title={`BMAC: ${u.sanctioned_bmac_email ?? "unknown"}`}
                        >
                          pending claim
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-400">
                      <Skull className="h-3 w-3 text-neutral-600" />
                      {u.soul_count}
                    </div>
                  </td>
                  <td className="py-3 font-mono text-xs text-neutral-600">
                    {new Date(u.created_at).toLocaleDateString(undefined, {
                      year: "numeric", month: "short", day: "numeric",
                    })}
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
            disabled={page === 0}
            className="border border-neutral-800 p-2 text-neutral-500 hover:text-neutral-200 disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-xs text-neutral-500">
            page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="border border-neutral-800 p-2 text-neutral-500 hover:text-neutral-200 disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
