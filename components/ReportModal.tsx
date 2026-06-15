"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertOctagon, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const REASONS = [
  { value: "illegal_content",  label: "Illegal content" },
  { value: "child_safety",     label: "Child safety concern" },
  { value: "hate_speech",      label: "Hate speech / discrimination" },
  { value: "harassment",       label: "Harassment or threats" },
  { value: "graphic_violence", label: "Graphic violence" },
  { value: "spam_scam",        label: "Spam or scam" },
  { value: "impersonation",    label: "Impersonation" },
  { value: "other",            label: "Other" },
] as const;

type Reason = (typeof REASONS)[number]["value"];

export function ReportModal({
  soulId,
  soulName,
  onClose,
}: {
  soulId: string;
  soulName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit() {
    if (!reason || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soulId, reason, details: details.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "something went wrong");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setErrorMsg("network error — try again");
      setState("error");
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md border border-neutral-800 bg-neutral-950 p-6"
        >
          {/* header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-red-400" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-red-400">
                  report soul
                </span>
              </div>
              <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tighter">
                {soulName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-200"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {state === "done" ? (
            <div className="mt-8 flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-8 w-8 text-acid" />
              <p className="font-mono text-sm text-neutral-300">
                report received. our moderation team will review it.
              </p>
              <button
                onClick={onClose}
                className="mt-2 border border-neutral-700 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-neutral-200"
              >
                close
              </button>
            </div>
          ) : (
            <>
              <p className="mt-4 font-mono text-xs text-neutral-500">
                &gt; Select the reason that best describes the issue.
              </p>

              {/* reason grid */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setReason(r.value)}
                    className={cn(
                      "border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.15em] transition-colors",
                      reason === r.value
                        ? "border-red-500 bg-red-500/10 text-red-300"
                        : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* optional details */}
              <div className="mt-4">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                  additional context (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="..."
                  className="mt-1 w-full resize-none border border-neutral-800 bg-transparent px-3 py-2 font-mono text-xs text-neutral-300 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
                />
              </div>

              {state === "error" && (
                <p className="mt-2 font-mono text-[10px] text-red-400">&gt; {errorMsg}</p>
              )}

              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="font-mono text-xs text-neutral-500 hover:text-neutral-300"
                >
                  cancel
                </button>
                <button
                  onClick={submit}
                  disabled={!reason || state === "loading"}
                  className={cn(
                    "flex items-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors",
                    reason && state !== "loading"
                      ? "border-red-500 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                      : "cursor-not-allowed border-neutral-800 text-neutral-600"
                  )}
                >
                  {state === "loading" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  submit report
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
