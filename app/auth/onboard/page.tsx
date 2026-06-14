"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { validateUsername, checkUsernameAvailable, createProfile } from "@/lib/db/profiles";

// /auth/onboard — first stop after signing up.
// if the user already has a profile we ship them onward immediately.
// if not, they pick a username (one shot, kind of permanent — we can
// build username changes later).

export default function OnboardPage() {
  const router = useRouter();
  const [bootChecking, setBootChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avail, setAvail] = useState<null | { ok: true } | { ok: false; reason: string }>(null);
  const [checking, setChecking] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // on mount: if no session → /auth. if profile exists → /chamber.
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setEmail(user.email ?? null);
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        router.replace("/chamber");
        return;
      }
      setBootChecking(false);
    })();
  }, [router]);

  // live availability check, debounced
  useEffect(() => {
    if (!username) { setAvail(null); return; }
    const v = validateUsername(username);
    if (!v.ok) { setAvail(v); return; }
    setChecking(true);
    const t = setTimeout(async () => {
      const free = await checkUsernameAvailable(username);
      setChecking(false);
      setAvail(free ? { ok: true } : { ok: false, reason: "taken" });
    }, 350);
    return () => clearTimeout(t);
  }, [username]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!avail || !avail.ok) {
      setErr(avail && !avail.ok ? avail.reason : "pick a username first");
      return;
    }
    setPending(true);
    const result = await createProfile({
      username,
      displayName: displayName.trim() || undefined,
    });
    setPending(false);
    if (!result.ok) {
      setErr(result.reason);
      return;
    }
    // hard nav (not router.replace) so the root layout re-renders with
    // the new profile. router.replace serves a cached Nav that was
    // rendered before the profile existed → "Pick a Handle" sticks.
    window.location.assign("/forge?fresh=1");
  }

  if (bootChecking) {
    return (
      <div className="mx-auto flex max-w-md flex-col px-6 py-32 font-mono text-xs text-neutral-500">
        <span className="inline-block h-2 w-2 animate-flicker bg-acid align-middle" />
        <span className="ml-2">resolving session...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        bind operator :: phase final
      </div>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tighter">
        Pick a handle<span className="text-acid">.</span>
      </h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        &gt; This is how the network will know you. Forging is private by default — your handle only surfaces when you publish a soul to the public Chamber.
      </p>
      {email && (
        <p className="mt-1 font-mono text-[10px] text-neutral-700">
          &gt; signed in as <span className="text-neutral-400">{email}</span>
        </p>
      )}

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            handle
          </label>
          <div className={cn(
            "mt-2 flex items-center gap-2 border bg-neutral-950 px-3 py-3 transition-colors",
            avail && avail.ok ? "border-acid" : avail && !avail.ok ? "border-red-500/60" : "border-neutral-800 focus-within:border-neutral-500"
          )}>
            <span className="font-mono text-sm text-neutral-600">@</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              placeholder="vandal"
              maxLength={30}
              className="flex-1 bg-transparent font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-700"
            />
            {checking && (
              <span className="font-mono text-[10px] text-neutral-500">checking...</span>
            )}
            {!checking && avail?.ok && <Check className="h-3.5 w-3.5 text-acid" />}
            {!checking && avail && !avail.ok && <X className="h-3.5 w-3.5 text-red-400" />}
          </div>
          {avail && !avail.ok && (
            <div className="mt-1 font-mono text-[10px] text-red-300">{avail.reason}</div>
          )}
          <div className="mt-1 font-mono text-[10px] text-neutral-600">
            &gt; lowercase letters, numbers, _ and - only. 3-30 chars.
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            display name <span className="text-neutral-700">(optional)</span>
          </label>
          <div className="mt-2 flex items-center gap-2 border border-neutral-800 bg-neutral-950 px-3 py-3 focus-within:border-neutral-500">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="what should the chamber call you?"
              maxLength={50}
              className="flex-1 bg-transparent font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending || !avail?.ok}
          className={cn(
            "mt-2 group flex items-center justify-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
            pending || !avail?.ok
              ? "border-neutral-800 text-neutral-600"
              : "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.7)]"
          )}
        >
          {pending ? "binding..." : "enter the forge"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>

        {err && (
          <div className="mt-2 flex items-start gap-2 border border-red-500/40 bg-red-500/5 p-3 font-mono text-[11px] text-red-300">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{err}</span>
          </div>
        )}
      </form>
    </div>
  );
}
