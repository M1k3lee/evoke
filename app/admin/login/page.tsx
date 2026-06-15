"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Skull } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "login failed");
        setLoading(false);
        return;
      }
      router.push("/admin");
    } catch {
      setError("network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
          <Skull className="h-3 w-3" />
          evoke admin
        </div>
        <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tighter">
          Access<span className="text-acid">.</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-500">&gt; Authorised personnel only.</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full border border-neutral-800 bg-transparent px-3 py-2 font-mono text-sm text-neutral-200 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
              placeholder="admin@evoke"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full border border-neutral-800 bg-transparent px-3 py-2 font-mono text-sm text-neutral-200 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400">&gt; {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-acid bg-acid/10 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-acid hover:bg-acid hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {loading ? "authenticating…" : "enter"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
