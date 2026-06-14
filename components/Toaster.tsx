"use client";
import { Toaster as SonnerToaster, toast } from "sonner";
import { Check, X, Skull, Zap } from "lucide-react";
import { ERROR, SUCCESS, GATE, type CopyBlock } from "@/constants/copy";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      gap={10}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "w-[360px] border border-neutral-800 bg-[#0a0a0a]/95 backdrop-blur p-4 font-mono text-xs text-neutral-200 shadow-[0_0_40px_-12px_rgba(0,0,0,0.9)]",
        },
      }}
    />
  );
}

function ToastBody({
  block,
  tone,
}: {
  block: CopyBlock;
  tone: "success" | "error" | "info" | "gate";
}) {
  const palette = {
    success: { bar: "bg-acid", title: "text-acid", Icon: Check },
    error: { bar: "bg-[#FF0066]", title: "text-[#FF0066]", Icon: X },
    info: { bar: "bg-cyan", title: "text-cyan", Icon: Zap },
    gate: { bar: "bg-yellow-400", title: "text-yellow-400", Icon: Skull },
  }[tone];

  return (
    <div className="relative flex items-start gap-3">
      <div className={`absolute -left-4 top-0 h-full w-px ${palette.bar}`} />
      <div className={`mt-0.5 grid h-6 w-6 place-items-center border border-neutral-800 ${palette.title}`}>
        <palette.Icon className="h-3 w-3" />
      </div>
      <div className="flex-1">
        <div className={`text-[11px] font-bold uppercase tracking-[0.2em] ${palette.title}`}>
          {block.title}
        </div>
        <div className="mt-1 text-[12px] leading-relaxed text-neutral-400">
          &gt; {block.body}
        </div>
      </div>
    </div>
  );
}

/** Public API. Use these everywhere instead of toast.success/error directly. */
export const evoke = {
  success: (block: CopyBlock = SUCCESS.SAVED) =>
    toast.custom(() => <ToastBody block={block} tone="success" />),
  error: (block: CopyBlock = ERROR.GENERIC) =>
    toast.custom(() => <ToastBody block={block} tone="error" />),
  info: (block: CopyBlock) =>
    toast.custom(() => <ToastBody block={block} tone="info" />),
  gate: (block: CopyBlock = GATE.UPGRADE) =>
    toast.custom(() => <ToastBody block={block} tone="gate" />, { duration: 6000 }),
};
