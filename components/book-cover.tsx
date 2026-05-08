"use client";

import { useEffect, useState } from "react";

const GENRE_GRADIENTS: Record<string, string> = {
  fiction:    "linear-gradient(160deg, #4f46e5 0%, #7c3aed 100%)",
  scifi:      "linear-gradient(160deg, #0ea5e9 0%, #6366f1 100%)",
  fantasy:    "linear-gradient(160deg, #059669 0%, #0d9488 100%)",
  mystery:    "linear-gradient(160deg, #dc2626 0%, #9f1239 100%)",
  biography:  "linear-gradient(160deg, #d97706 0%, #b45309 100%)",
  history:    "linear-gradient(160deg, #92400e 0%, #78350f 100%)",
  self_help:  "linear-gradient(160deg, #16a34a 0%, #15803d 100%)",
  romance:    "linear-gradient(160deg, #db2777 0%, #be185d 100%)",
  literary:   "linear-gradient(160deg, #7c3aed 0%, #4f46e5 100%)",
  nonfiction: "linear-gradient(160deg, #475569 0%, #334155 100%)",
};

function coverGradient(genre: string | null): string {
  if (!genre) return "linear-gradient(160deg, #374151 0%, #1f2937 100%)";
  const key = genre.toLowerCase().replace(/[\s_-]/g, "");
  return GENRE_GRADIENTS[key] ?? "linear-gradient(160deg, #374151 0%, #1f2937 100%)";
}

/**
 * Fills its parent container (which must be `relative overflow-hidden`).
 * Fetches a cover from Open Library; falls back to Google Books if not found;
 * finally falls back to a genre gradient with the title overlaid.
 */
export function BookCover({
  title,
  author,
  genre,
}: {
  title: string;
  author: string;
  genre: string | null;
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function fetchCover() {
      // 1. Try Open Library search API
      try {
        const q = encodeURIComponent(title);
        const a = encodeURIComponent(author.split(" ")[0]); // use first word of author name
        const res = await fetch(
          `https://openlibrary.org/search.json?title=${q}&author=${a}&fields=cover_i&limit=1`
        );
        const data = await res.json();
        const coverId = data?.docs?.[0]?.cover_i;
        if (coverId) {
          setCoverUrl(`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`);
          return;
        }
      } catch {}

      // 2. Fall back to Google Books
      try {
        const query = encodeURIComponent(`intitle:${title} inauthor:${author}`);
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&fields=items(volumeInfo/imageLinks)`
        );
        const data = await res.json();
        const links = data?.items?.[0]?.volumeInfo?.imageLinks;
        const thumb = links?.thumbnail ?? links?.smallThumbnail;
        if (thumb) {
          setCoverUrl(thumb.replace("http://", "https://"));
        }
      } catch {}
    }

    fetchCover();
  }, [title, author]);

  if (coverUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-2 text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-white/90"
      style={{ background: coverGradient(genre) }}
    >
      {title}
    </div>
  );
}
