"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, Github, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

function AuthInner() {
  const params = useSearchParams();
  const router = useRouter();
  const isSync = params.get("mode") === "sync";
  const externalErr = params.get("err");

  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<"email" | "github" | null>(null);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(externalErr);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) {
      setErr("type an email first");
      return;
    }
    setPending("email");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setPending(null);
    if (error) {
      setErr(error.message);
      return;
    }
    setSent(true);
  }

  async function signInWithGitHub() {
    setErr(null);
    setPending("github");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setPending(null);
      setErr(error.message);
    }
    // on success the browser navigates away to GitHub
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        {isSync ? "consciousness sync" : "memory recall"}
      </div>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tighter">
        {isSync ? "Sync Consciousness" : "Recall Memory"}
        <span className="text-acid">.</span>
      </h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        &gt; {isSync
          ? "Bind your operator. Your vault will sync across every device."
          : "Re-enter the grid. Your forged constructs are waiting."}
      </p>
      <p className="mt-1 font-mono text-[10px] text-neutral-700">
        &gt; sign in or sign up — same form. we don't make you pick.
      </p>

      {sent ? (
        <div className="mt-8 flex flex-col gap-3 border border-acid bg-acid/5 p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-acid">
            <Check className="h-3 w-3" /> magic link dispatched
          </div>
          <div className="font-mono text-sm text-neutral-200">
            Check <span className="text-acid">{email}</span>. Click the link in
            the email and you'll land back here, signed in.
          </div>
          <div className="font-mono text-[10px] text-neutral-500">
            &gt; the email can take 30-60 seconds. check spam if it doesn't show.
          </div>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="self-start font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:text-acid"
          >
            wrong email? try again →
          </button>
        </div>
      ) : (
        <>
          {/* GitHub button — the fast path for the dev crowd */}
          <button
            onClick={signInWithGitHub}
            disabled={!!pending}
            className={cn(
              "mt-8 flex items-center justify-center gap-3 border px-5 py-4 font-mono text-xs uppercase tracking-widest transition-all",
              pending === "github"
                ? "border-neutral-600 text-neutral-500"
                : "border-neutral-700 text-neutral-100 hover:border-acid hover:text-acid"
            )}
          >
            <Github className="h-4 w-4" />
            {pending === "github" ? "redirecting..." : "continue with GitHub"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-900" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">or</span>
            <div className="h-px flex-1 bg-neutral-900" />
          </div>

          {/* Magic link form */}
          <form onSubmit={signInWithEmail} className="flex flex-col gap-3">
            <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              operator_email
            </label>
            <div className="flex items-center gap-2 border border-neutral-800 bg-neutral-950 px-3 py-3 focus-within:border-acid">
              <Mail className="h-3.5 w-3.5 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nowhere.net"
                disabled={!!pending}
                className="flex-1 bg-transparent font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-700"
              />
            </div>
            <button
              type="submit"
              disabled={!!pending}
              className={cn(
                "mt-2 group flex items-center justify-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
                pending === "email"
                  ? "border-neutral-700 text-neutral-500"
                  : "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
              )}
            >
              {pending === "email" ? "dispatching..." : "send magic link"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
          <p className="mt-3 font-mono text-[10px] text-neutral-600">
            &gt; we'll email a one-time link. no password to remember.
          </p>
        </>
      )}

      {err && (
        <div className="mt-6 flex items-start gap-2 border border-red-500/40 bg-red-500/5 p-3 font-mono text-[11px] text-red-300">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      <div className="mt-12 border-t border-neutral-900 pt-6">
        <Link
          href="/chamber"
          className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 hover:text-acid"
        >
          ← browse the public chamber without an account
        </Link>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthInner />
    </Suspense>
  );
}
