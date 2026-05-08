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
      <Button variant="outline" size="sm" disabled>
        Saved ✓
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={status === "saving"}
      >
        {status === "saving" ? "Saving..." : "Save"}
      </Button>
      {errorMsg && (
        <span className="text-xs text-destructive">{errorMsg}</span>
      )}
    </div>
  );
}