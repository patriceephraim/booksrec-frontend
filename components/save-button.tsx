"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthedApi } from "@/lib/use-authed-api";
import type { BookRecommendation } from "@/lib/types";

/**
 * Save button with three states:
 *   - idle: "Save"
 *   - saving: "Saving..." (disabled)
 *   - saved: "Saved ✓" (disabled, persists for the rest of the session)
 *
 * If the API call fails, we show an error label inline. We don't toast or
 * alert — keeps the UI calm. Failed saves are rare; visible-but-quiet is
 * the right tone for them.
 */

type Status = "idle" | "saving" | "saved" | "error";

export function SaveButton({ book }: { book: BookRecommendation }) {
  const { save } = useAuthedApi();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleClick() {
    setStatus("saving");
    setErrorMsg(null);
    try {
      await save(book);
      setStatus("saved");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
    }
  }

  if (status === "saved") {
    return (
      <Button
        size="sm"
        disabled
        className="rounded-full border border-green-500/30 bg-green-500/10 text-green-400"
      >
        Saved ✓
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleClick}
        disabled={status === "saving"}
        className="rounded-full bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"
      >
        {status === "saving" ? "Saving..." : "Save"}
      </Button>
      {errorMsg && (
        <span className="text-xs text-red-400">{errorMsg}</span>
      )}
    </div>
  );
}