import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * "My Books" page — server component.
 *
 * Runs on the server, fetches the user's saved books directly from the
 * FastAPI backend with the Clerk session token, and renders the list.
 *
 * Why a server component? Three wins:
 *   1. The fetch happens server-to-server (faster, no CORS, no exposing
 *      the API URL to the browser more than necessary).
 *   2. The Clerk session token never touches the client.
 *   3. The HTML arrives already populated — no loading spinner on first paint.
 */

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
    // Don't cache — saved books can change anytime.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load saved books: ${res.status}`);
  }

  const data = (await res.json()) as { books: SavedBook[] };
  return data.books;
}

export default async function SavedPage() {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    // Middleware should have already redirected, but belt-and-suspenders.
    return <p className="p-6">Please sign in.</p>;
  }

  const books = await fetchSavedBooks(token);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My books</h1>
          <p className="text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? "book" : "books"} saved
          </p>
        </div>
        <Link href="/quiz">
          <Button>Find more</Button>
        </Link>
      </header>

      {books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t saved any books yet.
            </p>
            <Link href="/quiz">
              <Button>Take the quiz</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {books.map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <CardTitle>{b.title}</CardTitle>
                  {b.year && (
                    <span className="text-sm text-muted-foreground">{b.year}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {b.author}
                  {b.genre && <> &middot; {b.genre}</>}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {b.why_recommended && (
                  <p className="text-sm">{b.why_recommended}</p>
                )}
                {b.goodreads_url && (
                  <a
                    href={b.goodreads_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium underline underline-offset-4"
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
  );
}