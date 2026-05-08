import { currentUser, auth } from "@clerk/nextjs/server";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LastRecommendations } from "@/components/last-recommendations";
import { redirect } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SavedBook = { id: string };

async function fetchSavedCount(token: string): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/api/saved`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const data = (await res.json()) as { books: SavedBook[] };
    return data.books.length;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const user = await currentUser();
  const { getToken } = await auth();
  const token = await getToken();

  const greeting =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress.split("@")[0] ??
    "reader";

  const savedCount = token ? await fetchSavedCount(token) : 0;

  if (savedCount === 0) redirect("/quiz");

  return (
    <div className="min-h-screen">
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">

        {/* Greeting */}
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-bold text-white sm:text-4xl">Hello, {greeting} 👋</h1>
          <p className="mt-2 text-white/40 text-sm sm:text-base">Discover your next great read, tailored just for you.</p>
        </div>

        {/* Stats */}
        <div className="mb-14 flex justify-center">
          <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 backdrop-blur-sm">
            <BookOpen size={20} style={{ color: "#a78bfa" }} strokeWidth={1.5} />
            <div>
              <div className="text-2xl font-bold text-white leading-none">{savedCount}</div>
              <div className="mt-1 text-xs text-white/40">Books Saved</div>
            </div>
          </div>
        </div>

        {/* Recommended section */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white sm:text-xl">
            Recommended for you
            <span className="text-violet-400 text-base">✦</span>
          </h2>
          <Link
            href="/quiz"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/50 transition-colors hover:text-white"
          >
            Get new picks →
          </Link>
        </div>

        <LastRecommendations />

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-3">
          <Link href="/quiz">
            <Button
              size="lg"
              className="rounded-full px-10 text-white hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              ✦ Take a new quiz
            </Button>
          </Link>
          <p className="text-sm text-white/25">Get even better recommendations</p>
        </div>

      </main>
    </div>
  );
}
