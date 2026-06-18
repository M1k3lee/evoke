"use client";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleBookmark } from "@/lib/db/bookmarks";

export function BookmarkButton({
  soulId,
  initialBookmarked = false,
  signedIn,
}: {
  soulId: string;
  initialBookmarked?: boolean;
  signedIn: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) { window.location.href = "/auth"; return; }
    if (pending) return;
    const prev = bookmarked;
    setBookmarked(!prev);
    setPending(true);
    const result = await toggleBookmark(soulId);
    setPending(false);
    if (!result.ok) setBookmarked(prev);
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title={bookmarked ? "remove from // marked" : "// mark this soul"}
      aria-label={bookmarked ? "remove bookmark" : "bookmark"}
      className={cn(
        "grid h-7 w-7 place-items-center border transition-colors",
        bookmarked
          ? "border-acid/60 text-acid"
          : "border-neutral-800 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200",
      )}
    >
      <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-acid stroke-acid")} />
    </button>
  );
}
