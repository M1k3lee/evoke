"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, Check, ArrowRight, Plus, X, Layers, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, type ProfileSignal } from "@/lib/db/profiles";
import {
  listMyCollections, createCollection, deleteCollection, type Collection,
} from "@/lib/db/collections";

// ─── types ────────────────────────────────────────────────────────────────────
type FullProfile = {
  display_name: string | null;
  bio: string | null;
  title: string | null;
  signals: ProfileSignal[];
  mature_content_enabled: boolean;
  sanctioned: boolean;
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
        {label}
      </label>
      {hint && (
        <div className="mt-0.5 font-mono text-[10px] text-neutral-700">{hint}</div>
      )}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, maxLength, mono = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center border border-neutral-800 bg-neutral-950 px-3 py-2.5 focus-within:border-neutral-600">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "flex-1 bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-700",
          mono && "font-mono",
        )}
      />
      {maxLength && value.length > maxLength * 0.8 && (
        <span className="ml-2 shrink-0 font-mono text-[10px] text-neutral-700">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [username, setUsername] = useState("");

  // profile edit state
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [signals, setSignals] = useState<ProfileSignal[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  // mature content
  const [mature, setMature] = useState(false);
  const [savingMature, setSavingMature] = useState(false);
  const [matureSaved, setMatureSaved] = useState(false);
  const [matureErr, setMatureErr] = useState<string | null>(null);

  // collections
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColPublic, setNewColPublic] = useState(false);
  const [creatingCol, setCreatingCol] = useState(false);
  const [colErr, setColErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setSignedIn(true);

      const [{ data: p }, cols] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, display_name, bio, title, signals, mature_content_enabled, sanctioned")
          .eq("id", user.id)
          .maybeSingle(),
        listMyCollections(),
      ]);

      if (p) {
        setProfile(p as FullProfile);
        setUsername(p.username ?? "");
        setDisplayName(p.display_name ?? "");
        setTitle(p.title ?? "");
        setBio(p.bio ?? "");
        setSignals(Array.isArray(p.signals) ? p.signals : []);
        setMature(!!p.mature_content_enabled);
      }
      setCollections(cols);
      setLoading(false);
    })();
  }, []);

  // ── profile save ────────────────────────────────────────────────────────────
  async function saveProfile() {
    setProfileErr(null);
    setProfileSaved(false);
    setSavingProfile(true);
    const r = await updateProfile({
      displayName: displayName.trim() || null,
      title: title.trim() || null,
      bio: bio.trim() || null,
      signals: signals.filter((s) => s.label.trim() && s.url.trim()),
    });
    setSavingProfile(false);
    if (!r.ok) { setProfileErr(r.reason); return; }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  // ── signals helpers ─────────────────────────────────────────────────────────
  function addSignal() {
    if (signals.length >= 5) return;
    setSignals([...signals, { label: "", url: "" }]);
  }
  function removeSignal(i: number) {
    setSignals(signals.filter((_, idx) => idx !== i));
  }
  function updateSignal(i: number, field: keyof ProfileSignal, val: string) {
    setSignals(signals.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  }

  // ── mature toggle ────────────────────────────────────────────────────────────
  async function toggleMature() {
    setMatureErr(null);
    setMatureSaved(false);
    const next = !mature;
    setMature(next);
    setSavingMature(true);
    const r = await updateProfile({ matureContentEnabled: next });
    setSavingMature(false);
    if (!r.ok) { setMatureErr(r.reason); setMature(!next); return; }
    setMatureSaved(true);
    setTimeout(() => setMatureSaved(false), 2000);
  }

  // ── collection create ────────────────────────────────────────────────────────
  async function addCollection() {
    if (!newColName.trim()) return;
    setColErr(null);
    setCreatingCol(true);
    const r = await createCollection({
      name: newColName.trim(),
      description: newColDesc.trim() || undefined,
      isPublic: newColPublic,
    });
    setCreatingCol(false);
    if (!r.ok) { setColErr(r.reason); return; }
    setNewColName("");
    setNewColDesc("");
    setNewColPublic(false);
    const cols = await listMyCollections();
    setCollections(cols);
  }

  async function removeCollection(id: string) {
    await deleteCollection(id);
    setCollections(collections.filter((c) => c.id !== id));
  }

  // ── render guards ────────────────────────────────────────────────────────────
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
          Settings<span className="text-acid">.</span>
        </h1>
        <p className="mt-3 font-mono text-sm text-neutral-500">
          &gt; Sign in to edit your profile and settings.
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
      {/* header */}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        operator settings — @{username}
      </div>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
        Settings<span className="text-acid">.</span>
      </h1>

      {/* ── PROFILE SECTION ───────────────────────────────────────────────── */}
      <section className="mt-12">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">
          // profile
        </div>

        <div className="space-y-5 border border-neutral-800 bg-neutral-950/40 p-5">
          <Field label="Display name" hint="> what the chamber calls you">
            <TextInput
              value={displayName}
              onChange={setDisplayName}
              placeholder="leave blank to use your handle"
              maxLength={50}
            />
          </Field>

          <Field label="Title" hint="> your role, specialty, or one-line identity">
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="psycholinguist. rogue architect. pattern hunter."
              maxLength={80}
            />
          </Field>

          <Field label="Bio">
            <div className="border border-neutral-800 bg-neutral-950 focus-within:border-neutral-600">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="> something true about you"
                maxLength={200}
                rows={3}
                className="w-full resize-none bg-transparent p-3 font-mono text-sm text-neutral-100 placeholder:text-neutral-700 focus:outline-none"
              />
              <div className="border-t border-neutral-900 px-3 py-1.5 text-right font-mono text-[10px] text-neutral-700">
                {bio.length}/200
              </div>
            </div>
          </Field>

          {/* Signals */}
          <Field label="Signals" hint="> links the chamber can follow — max 5">
            <div className="space-y-2">
              {signals.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s.label}
                    onChange={(e) => updateSignal(i, "label", e.target.value)}
                    placeholder="GitHub"
                    maxLength={20}
                    className="w-28 shrink-0 border border-neutral-800 bg-neutral-950 px-2 py-2 font-mono text-xs text-neutral-100 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
                  />
                  <input
                    value={s.url}
                    onChange={(e) => updateSignal(i, "url", e.target.value)}
                    placeholder="https://github.com/you"
                    maxLength={200}
                    className="min-w-0 flex-1 border border-neutral-800 bg-neutral-950 px-2 py-2 font-mono text-xs text-neutral-100 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
                  />
                  <button
                    onClick={() => removeSignal(i)}
                    className="grid h-8 w-8 shrink-0 place-items-center border border-neutral-800 text-neutral-600 hover:border-red-500/60 hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {signals.length < 5 && (
                <button
                  onClick={addSignal}
                  className="flex items-center gap-2 border border-dashed border-neutral-800 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-600 transition-colors hover:border-neutral-600 hover:text-neutral-300"
                >
                  <Plus className="h-3 w-3" /> add signal
                </button>
              )}
            </div>
          </Field>

          {/* save button */}
          <div className="flex items-center gap-4 border-t border-neutral-900 pt-4">
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className={cn(
                "flex items-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all",
                savingProfile
                  ? "border-neutral-800 text-neutral-600"
                  : "border-acid bg-acid/10 text-acid hover:bg-acid hover:text-ink",
              )}
            >
              {savingProfile ? "saving..." : "save profile"}
            </button>
            {profileSaved && (
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-acid">
                <Check className="h-3 w-3" /> saved
              </span>
            )}
            {profileErr && (
              <span className="font-mono text-[11px] text-red-300">{profileErr}</span>
            )}
          </div>
        </div>

        {profile?.sanctioned && (
          <div className="mt-3 border border-acid/20 bg-acid/5 px-4 py-3 font-mono text-xs text-acid">
            <span className="mr-2 font-bold">[SANCTIONED]</span>
            Your account is verified. You can publish souls at all spice levels to the Chamber.
          </div>
        )}
      </section>

      {/* ── COLLECTIONS SECTION ───────────────────────────────────────────── */}
      <section className="mt-12">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">
          // collections
        </div>

        <div className="border border-neutral-800 bg-neutral-950/40 p-5">
          {collections.length > 0 ? (
            <div className="mb-5 space-y-2">
              {collections.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 border border-neutral-800 bg-black/30 px-4 py-3"
                >
                  <Layers className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm text-neutral-200">{c.name}</div>
                    {c.description && (
                      <div className="font-mono text-[10px] text-neutral-600">{c.description}</div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[10px] uppercase tracking-widest",
                      c.is_public ? "text-acid" : "text-neutral-700",
                    )}
                  >
                    {c.is_public ? "public" : "private"}
                  </span>
                  <button
                    onClick={() => removeCollection(c.id)}
                    className="grid h-6 w-6 shrink-0 place-items-center text-neutral-700 hover:text-red-400"
                    title="Delete collection"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-5 font-mono text-xs text-neutral-600">
              &gt; no collections yet. group your souls into named sets.
            </p>
          )}

          {/* create new */}
          <div className="space-y-3 border-t border-neutral-900 pt-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
              new collection
            </div>
            <div className="flex gap-2">
              <input
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="collection name"
                maxLength={60}
                className="flex-1 border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
              />
            </div>
            <input
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              placeholder="description (optional)"
              maxLength={200}
              className="w-full border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-100 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
            />
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-neutral-500">
                <button
                  onClick={() => setNewColPublic(!newColPublic)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center border transition-colors",
                    newColPublic ? "border-acid bg-acid/20" : "border-neutral-700 bg-neutral-900",
                  )}
                >
                  <span className={cn(
                    "absolute h-3.5 w-3.5 transition-all",
                    newColPublic ? "left-4 bg-acid" : "left-0.5 bg-neutral-600",
                  )} />
                </button>
                public
              </label>
              <button
                onClick={addCollection}
                disabled={!newColName.trim() || creatingCol}
                className={cn(
                  "flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-all",
                  newColName.trim() && !creatingCol
                    ? "border-acid/60 text-acid hover:bg-acid/10"
                    : "border-neutral-800 text-neutral-700",
                )}
              >
                <Plus className="h-3 w-3" />
                {creatingCol ? "creating..." : "create"}
              </button>
            </div>
            {colErr && (
              <div className="font-mono text-[10px] text-red-300">{colErr}</div>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENT SECTION ───────────────────────────────────────────────── */}
      <section className="mt-12">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600">
          // content
        </div>

        <div className="border border-neutral-800 bg-neutral-950/40 p-5">
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
                &gt; Enabling this lets you view and upvote spice 3 souls in the Chamber. Confirms
                you are 18+ and accept that this content is for personal use.
              </p>
              <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-neutral-600">
                &gt; Spice 4 souls (Off-rails / explicit) require{" "}
                <span className="text-neutral-400">[SANCTIONED]</span> status to publish publicly.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-neutral-900 pt-4">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-300">
              Show explicit personalities in the Chamber
            </span>
            <button
              onClick={toggleMature}
              disabled={savingMature}
              className={cn(
                "relative inline-flex h-7 w-12 items-center border transition-colors",
                mature ? "border-acid bg-acid/20" : "border-neutral-700 bg-neutral-900",
              )}
              aria-pressed={mature}
            >
              <span className={cn(
                "absolute h-5 w-5 transition-all",
                mature ? "left-6 bg-acid" : "left-1 bg-neutral-500",
              )} />
            </button>
          </div>
          {savingMature && (
            <div className="mt-2 font-mono text-[10.5px] text-neutral-500">saving...</div>
          )}
          {matureSaved && (
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[10.5px] text-acid">
              <Check className="h-3 w-3" /> saved
            </div>
          )}
          {matureErr && (
            <div className="mt-2 font-mono text-[10.5px] text-red-300">{matureErr}</div>
          )}
        </div>
      </section>

      <Link
        href="/chamber"
        className="mt-14 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-600 hover:text-acid"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> back to the chamber
      </Link>
    </div>
  );
}
