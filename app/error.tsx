"use client";
import { useEffect } from "react";
import { FaultScreen } from "@/components/FaultScreen";
import { ERROR } from "@/constants/copy";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EVOKE] cognitive fault:", error);
  }, [error]);

  return (
    <FaultScreen
      block={ERROR.GENERIC}
      onRetry={reset}
      code={error.digest?.slice(0, 6).toUpperCase() ?? "0xDEAD"}
    />
  );
}
