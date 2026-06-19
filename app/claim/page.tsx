"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Coffee } from "lucide-react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

type State = "loading" | "unsigned" | "already" | "pending" | "idle" | "submitting" | "done" | "error";

export default function ClaimPage() {
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("unsigned"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("sanctioned, sanctioned_claimed_at")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.sanctioned) { setState("already"); return; }
      if (data?.sanctioned_claimed_at) { setState("pending"); return; }
      setState("idle");
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setErrMsg("enter the email you used on Buy Me a Coffee"); return; }
    setState("submitting");
    setErrMsg("");
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error ?? "something went wrong"); setState("idle"); return; }
      setState("done");
    } catch {
      setErrMsg("network error — try again");
      setState("idle");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        sanctioned status // claim
      </div>

      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
        Claim<span className="text-acid">.</span>
      </h1>

      <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-400">
        &gt; Donated via Buy Me a Coffee? Submit the email you used and an admin will verify and activate your{" "}
        <span className="text-acid">[SANCTIONED]</span> status.
      </p>
      <p className="mt-2 font-mono text-xs text-neutral-600">
        &gt; Unlocks publishing and viewing souls at all spice levels in the Chamber.
      </p>

      <div className="mt-10">
        {state === "loading" && (
          <div className="font-mono text-xs text-neutral-600">
            <span className="inline-block h-2 w-2 animate-flicker bg-acid align-middle" />
            <span className="ml-2">checking your status...</span>
          </div>
        )}

        {state === "unsigned" && (
          <div className="border border-neutral-800 bg-neutral-950/40 p-6 text-center">
            <p className="font-mono text-sm text-neutral-400">
              &gt; You need to be signed in to claim status.
            </p>
            <Link
              href="/auth?mode=sync"
              className="mt-4 inline-flex items-center gap-2 border border-acid bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
            >
              sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {state === "already" && (
          <div className="border border-acid/40 bg-acid/5 p-6">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-acid" />
              <div>
                <div className="font-mono text-sm font-bold uppercase tracking-widest text-acid">
                  [SANCTIONED]
                </div>
                <p className="mt-1 font-mono text-xs text-neutral-400">
                  Your status is already active.
                </p>
              </div>
            </div>
            <Link
              href="/chamber"
              className="mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-acid"
            >
              back to the chamber <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {state === "pending" && (
          <div className="border border-neutral-700 bg-neutral-950/40 p-6">
            <div className="font-mono text-sm text-neutral-300">
              // claim submitted
            </div>
            <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-500">
              &gt; Your claim is in the queue. An admin will verify your donation and activate{" "}
              <span className="text-acid">[SANCTIONED]</span> status shortly.
            </p>
            <p className="mt-2 font-mono text-xs text-neutral-700">
              &gt; Nothing to do — we'll handle it from here.
            </p>
          </div>
        )}

        {(state === "idle" || state === "submitting" || state === "error") && (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Buy Me a Coffee email
              </label>
              <div className={cn(
                "mt-2 flex items-center border bg-neutral-950 px-3 py-3 transition-colors focus-within:border-neutral-600",
                errMsg ? "border-red-500/60" : "border-neutral-800",
              )}>
                <Coffee className="mr-2 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="the email you donated with"
                  required
                  className="flex-1 bg-transparent font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-700"
                />
              </div>
              {errMsg && (
                <div className="mt-1.5 font-mono text-[10px] text-red-300">{errMsg}</div>
              )}
            </div>

            <p className="font-mono text-[10px] leading-relaxed text-neutral-700">
              &gt; This goes to an admin for manual verification. We check it against our{" "}
              <a
                href="https://buymeacoffee.com/EVOKEAI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-acid"
              >
                BMAC supporters list
              </a>
              . No automation — just a human checking.
            </p>

            <button
              type="submit"
              disabled={state === "submitting"}
              className={cn(
                "group flex w-full items-center justify-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all",
                state === "submitting"
                  ? "border-neutral-800 text-neutral-600"
                  : "border-acid bg-acid/10 text-acid hover:bg-acid hover:text-ink",
              )}
            >
              {state === "submitting" ? "submitting..." : "submit claim"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        )}

        {state === "done" && (
          <div className="border border-acid/40 bg-acid/5 p-6">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-acid" />
              <div>
                <div className="font-mono text-sm text-acid">claim received</div>
                <p className="mt-1 font-mono text-xs text-neutral-400">
                  &gt; An admin will verify your donation and activate{" "}
                  <span className="text-acid">[SANCTIONED]</span> status. Usually within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {(state === "idle" || state === "submitting" || state === "done") && (
        <div className="mt-10 border-t border-neutral-900 pt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-700">
            // haven't donated yet?
          </div>
          <a
            href="https://buymeacoffee.com/EVOKEAI"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-neutral-500 transition-colors hover:text-acid"
          >
            <Coffee className="h-3.5 w-3.5" />
            buymeacoffee.com/EVOKEAI <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
