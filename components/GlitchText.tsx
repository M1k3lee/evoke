"use client";
import { cn } from "@/lib/cn";

export function GlitchText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span data-text={children} className={cn("glitch", className)}>
      {children}
    </span>
  );
}
