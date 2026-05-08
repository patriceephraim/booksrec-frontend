import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/book-cover";
import { UnsaveButton } from "@/components/unsave-button";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SavedBook = {
  id: string;
  title: string;
  author: string;
  year: number | null;
  genre: string | null;
  why_recommended: string | null;
  goodreads_url: string | null;
  saved_at: string;
};

async function fetchSavedBooks(token: string): Promise<SavedBook[]> {
  const res = await fetch(`${API_URL}/api/saved`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load saved books: ${res.status}`);
  const data = (await res.json()) as { books: SavedBook[] };
  return data.books;
}


export default async function SavedPage() {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return <p className="p-6 text-white/50">Please sign in.</p>;
  }

  const books = await fetchSavedBooks(token);

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 pt-6 sm:p-6 sm:pt-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">My books</h1>
            <p className="mt-0.5 text-sm text-white/40">
              {books.length} {books.length === 1 ? "book" : "books"} saved
            </p>
          </div>
          <Link href="/quiz">
            <Button className="rounded-full bg-violet-600 hover:bg-violet-700 text-white">
              Find more
            </Button>
          </Link>
        </header>

        {books.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-white/40">You haven&apos;t saved any books yet.</p>
              <Link href="/quiz">
                <Button className="rounded-full bg-violet-600 hover:bg-violet-700 text-white">
                  Take the quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {books.map((b) => (
              <Card key={b.id} className="border-white/10 bg-white/5">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Cover */}
                    <div className="relative hidden sm:block h-20 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                      <BookCover title={b.title} author={b.author} genre={b.genre} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <CardTitle className="text-white">{b.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {b.year && <span className="text-sm text-white/30">{b.year}</span>}
                          <UnsaveButton bookId={b.id} />
                        </div>
                      </div>
                      <p className="mt-0.5 text-sm text-white/40">
                        {b.author}
                        {b.genre && <> &middot; {b.genre}</>}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {b.why_recommended && (
                    <p className="text-sm text-white/60">{b.why_recommended}</p>
                  )}
                  {b.goodreads_url && (
                    <a
                      href={b.goodreads_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-violet-400 underline underline-offset-4 hover:text-violet-300"
                    >
                      View on Goodreads &rarr;
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
