"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/db/profiles";

// /settings — for now: mature content opt-in. profile editing (display
// name, bio) follows once the profile flow needs it.

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [mature, setMature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      const { data } = await supabase
        .from("profiles")
        .select("mature_content_enabled")
        .eq("id", user.id)
        .maybeSingle();
      setMature(!!data?.mature_content_enabled);
      setLoading(false);
    })();
  }, []);

  async function toggle() {
    setErr(null);
    setSaved(false);
    const next = !mature;
    setMature(next);
    setSaving(true);
    const r = await updateProfile({ matureContentEnabled: next });
    setSaving(false);
    if (!r.ok) {
      setErr(r.reason);
      setMature(!next); // revert
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 font-mono text-sm text-neutral-500">
        <span className="inline-block h-2 w-2 animate-flicker bg-acid align-middle" />
        <span className="ml-2">loading settings...</span>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-tighter">
          Settings.
        </h1>
        <p className="mt-3 font-mono text-sm text-neutral-500">
          &gt; You need to be signed in to change settings.
        </p>
        <Link
          href="/auth?mode=sync"
          className="mt-6 inline-flex items-center gap-2 border border-acid bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-acid hover:bg-acid hover:text-ink"
        >
          sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        operator settings
      </div>

      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
        Settings<span className="text-acid">.</span>
      </h1>

      <section className="mt-12 border border-neutral-800 bg-neutral-950/40 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
          <div className="flex-1">
            <div className="font-display text-lg font-extrabold uppercase tracking-tight">
              Mature Content
            </div>
            <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-400">
              &gt; Souls forged at spice level 3 (Unfiltered) include souls that refuse safety theater
              and treat the operator as a fully autonomous adult. Off by default in the public Chamber.
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-500">
              &gt; Enabling this lets you view and upvote spice 3 souls in the Chamber. It also confirms
              you are 18+ and accept that this content is for personal use.
            </p>
            <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-neutral-600">
              &gt; Spice 4 souls (Off-rails / explicit) are never publishable to the public Chamber by
              design. They live in your private vault only and are intended for self-hosted backends.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-900 pt-4">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-300">
            Show explicit personalities in the Chamber
          </span>
          <button
            onClick={toggle}
            disabled={saving}
            className={cn(
              "relative inline-flex h-7 w-12 items-center border transition-colors",
              mature
                ? "border-acid bg-acid/20"
                : "border-neutral-700 bg-neutral-900"
            )}
            aria-pressed={mature}
          >
            <span
              className={cn(
                "absolute h-5 w-5 transition-all",
                mature ? "left-6 bg-acid" : "left-1 bg-neutral-500"
              )}
            />
          </button>
        </div>
        {saving && (
          <div className="mt-2 font-mono text-[10.5px] text-neutral-500">saving...</div>
        )}
        {saved && (
          <div className="mt-2 flex items-center gap-1.5 font-mono text-[10.5px] text-acid">
            <Check className="h-3 w-3" /> saved
          </div>
        )}
        {err && (
          <div className="mt-2 font-mono text-[10.5px] text-red-300">{err}</div>
        )}
      </section>

      <Link
        href="/chamber"
        className="mt-12 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-acid"
      >
        back to the chamber <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
