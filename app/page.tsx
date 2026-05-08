import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-10">

        {/* Badge */}
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          AI-powered book recommendations
        </div>

        {/* Headline */}
        <div className="space-y-5">
          <h1 className="text-6xl font-bold tracking-tight text-white drop-shadow-lg sm:text-7xl">
            Find your next
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #fcd34d 0%, #f97316 50%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              favorite book
            </span>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-white/60">
            Answer a short quiz about what you love to read. Our AI learns your
            taste and recommends books you&apos;ll actually finish.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-4">
          {userId ? (
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full bg-white px-8 text-black hover:bg-white/90">
                Go to dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full bg-white px-8 text-black hover:bg-white/90">
                  Get started free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/25 bg-black/20 px-8 text-white backdrop-blur-sm hover:bg-black/40"
                >
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Feature hints */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40">
          {["5-step quiz", "AI-matched picks", "Save your list"].map((f) => (
            <span key={f} className="flex items-center gap-2">
              <span className="h-px w-4 bg-white/20" />
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
