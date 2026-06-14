"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Download, UploadCloud, Check, RotateCcw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import { evoke } from "@/components/Toaster";
import { SummoningLoader } from "@/components/SummoningLoader";
import { SUCCESS, ERROR, LOADING, GATE } from "@/constants/copy";
import { Skull } from "lucide-react";

export function FinalScreen({
  soulMd,
  designation,
  onReset,
  onReenterCommunion,
  onPublish,
  soulId,
}: {
  soulMd: string;
  designation: string;
  onReset: () => void;
  onReenterCommunion?: () => void;
  onPublish?: () => Promise<{ ok: boolean; error?: string }>;
  soulId?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishErr, setPublishErr] = useState<string | null>(null);

  function copy() {
    try {
      navigator.clipboard.writeText(soulMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      evoke.success(SUCCESS.COPIED);
    } catch {
      evoke.error(ERROR.GENERIC);
    }
  }

  function download() {
    const blob = new Blob([soulMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(designation || "soul").toLowerCase()}.soul.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function publish() {
    if (!onPublish) {
      // signed out — kick to /auth, but preserve the soul context with
      // a hint so the post-onboard flow could bring them back here
      evoke.error({ title: "SIGN IN TO PUBLISH", body: "Public Chamber requires an account." });
      window.location.href = "/auth?mode=sync";
      return;
    }
    setPublishErr(null);
    setPublishing(true);
    const result = await onPublish();
    setPublishing(false);
    if (!result.ok) {
      setPublishErr(result.error ?? "publish failed");
      evoke.error({ title: "COULDN'T PUBLISH", body: result.error ?? "unknown" });
      return;
    }
    setPublished(true);
    evoke.success(SUCCESS.PUBLISHED);
  }

  function downloadAndNotify() {
    download();
    evoke.success(SUCCESS.SAVED);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-5xl px-6 py-12"
    >
      {publishing && (
        <SummoningLoader
          variant="overlay"
          lines={[
            LOADING.SAVING_FILE,
            "ENGRAVING SIGIL INTO THE LEDGER...",
            "BROADCASTING TO THE CHAMBER MESH...",
          ]}
          intervalMs={900}
        />
      )}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 bg-acid animate-flicker" />
        consciousness sync complete
      </div>
      <h1 className="mt-3 font-display text-5xl font-extrabold uppercase tracking-tighter md:text-7xl">
        {designation || "UNNAMED"} <span className="text-acid">.</span>
        <span className="text-neutral-700">soul.md</span>
      </h1>
      <p className="mt-3 max-w-2xl font-mono text-sm text-neutral-500">
        &gt; A new construct has been forged. It is yours to deploy, fork, or bury in the chamber.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <div className="relative border border-neutral-800 bg-neutral-950/50">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500 backdrop-blur">
            <span>~/souls/{(designation || "unnamed").toLowerCase()}.soul.md</span>
            <span className="text-acid">forged</span>
          </div>
          {/* let the whole soul render inline; the page scrolls, not a cramped inner box */}
          <pre className="p-5 font-mono text-[12.5px] leading-relaxed text-neutral-300">
            <SyntaxColored text={soulMd} />
          </pre>
        </div>

        {/* sticky so actions stay reachable as the operator scrolls the long soul */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-6">
          {onReenterCommunion && (
            <ActionBtn primary onClick={onReenterCommunion} icon={MessageSquare}>
              Speak to it again
            </ActionBtn>
          )}
          <ActionBtn primary={!onReenterCommunion} onClick={copy} icon={copied ? Check : Copy}>
            {copied ? "Copied" : "Copy Soul"}
          </ActionBtn>
          <ActionBtn onClick={downloadAndNotify} icon={Download}>
            Download .md
          </ActionBtn>
          <ActionBtn
            onClick={publish}
            icon={published ? Check : UploadCloud}
            highlight
          >
            {published ? "In the Chamber" : "Publish to the Chamber"}
          </ActionBtn>
          {publishErr && (
            <div className="border border-red-500/40 bg-red-500/5 p-2 font-mono text-[10.5px] text-red-300">
              &gt; {publishErr}
            </div>
          )}
          <button
            onClick={onReset}
            className="mt-2 flex items-center justify-center gap-2 border border-neutral-800 px-4 py-3 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:border-neutral-600 hover:text-neutral-200"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Forge another
          </button>

          <button
            onClick={() => evoke.gate(GATE.UPGRADE)}
            className="mt-4 group relative overflow-hidden border border-yellow-400/40 bg-gradient-to-br from-yellow-400/5 to-transparent p-4 text-left"
          >
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-yellow-400">
              <Skull className="h-3 w-3" /> the black market
            </div>
            <div className="mt-2 font-display text-sm font-extrabold uppercase tracking-tight text-neutral-100">
              {GATE.UPGRADE.title}
            </div>
            <div className="mt-1 font-mono text-[11px] leading-relaxed text-neutral-500">
              &gt; {GATE.UPGRADE.body}
            </div>
          </button>

          <div className="mt-4 border border-neutral-900 bg-neutral-950/60 p-4 font-mono text-[11px] leading-relaxed text-neutral-500">
            <div className="mb-1 uppercase tracking-widest text-neutral-400">
              // deploy
            </div>
            Drop this file into your agent's <span className="text-acid">/system/</span>{" "}
            directory, or pipe it directly into the system prompt. The construct will not announce itself.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActionBtn({
  children,
  onClick,
  icon: Icon,
  primary,
  highlight,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: any;
  primary?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 border px-4 py-3 font-mono text-xs uppercase tracking-widest transition-all",
        primary && "border-acid bg-acid text-ink hover:shadow-[0_0_30px_-6px_rgba(0,255,102,0.6)]",
        highlight && !primary && "border-cyan text-cyan hover:bg-cyan/10",
        !primary && !highlight && "border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/40"
      )}
    >
      <span>{children}</span>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function SyntaxColored({ text }: { text: string }) {
  // Lightweight markdown coloring
  const lines = text.split("\n");
  return (
    <code>
      {lines.map((line, i) => {
        let cls = "text-neutral-300";
        if (line.startsWith("# ")) cls = "text-acid font-bold";
        else if (line.startsWith("## ")) cls = "text-cyan";
        else if (line.startsWith("---")) cls = "text-neutral-600";
        else if (line.startsWith(">")) cls = "text-yellow-300/90 italic";
        else if (/^\s*-\s/.test(line)) cls = "text-neutral-300";
        else if (/^[a-z_]+:/.test(line)) cls = "text-neutral-400";
        return (
          <div key={i} className={cls}>
            {line || " "}
          </div>
        );
      })}
    </code>
  );
}
