"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { unsaveBook } from "@/lib/api";

export function UnsaveButton({ bookId }: { bookId: string }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      await unsaveBook(bookId, token);
      router.refresh();
    } catch {
      // silent — the book just won't disappear
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="text-white/25 hover:text-red-400 hover:bg-red-400/10"
      aria-label="Remove from saved"
    >
      <Trash2 size={14} />
    </Button>
  );
}
