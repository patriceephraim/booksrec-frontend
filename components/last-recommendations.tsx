"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";
import type { BookRecommendation } from "@/lib/types";

const LS_RESULTS_KEY = "booksrec_last_results";

export function LastRecommendations() {
  const [books, setBooks] = useState<BookRecommendation[] | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_RESULTS_KEY);
      setBooks(raw ? JSON.parse(raw) : []);
    } catch {
      setBooks([]);
    }
  }, []);

  // Still hydrating — render nothing to avoid layout shift
  if (books === undefined) return null;

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] py-20 text-center">
        <p className="text-white/30">No recommendations yet.</p>
        <p className="mt-2 text-sm text-white/20">Take the quiz and your picks will appear here.</p>
        <Link href="/quiz" className="mt-4">
          <Button className="rounded-full bg-violet-600 hover:bg-violet-700 text-white">
            Take the quiz
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {books.slice(0, 6).map((book, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
            <BookCover title={book.title} author={book.author} genre={book.genre} />
            {book.genre && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
                {book.genre}
              </span>
            )}
          </div>
          <div className="px-0.5">
            <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">{book.title}</p>
            <p className="mt-0.5 text-[11px] text-white/40">{book.author}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
