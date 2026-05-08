import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();
  const greeting =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress.split("@")[0] ??
    "reader";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      {/* Avatar in top-right with a dropdown for "manage account" / "sign out" */}
      <div className="absolute top-6 right-6">
        <UserButton />
      </div>

      <h1 className="text-3xl font-semibold">Hello, {greeting} 👋</h1>
      <p className="text-muted-foreground">
        You&apos;re signed in. Time to find your next favorite book.
      </p>
      <Link href="/quiz">
        <Button size="lg">Take the quiz</Button>
      </Link>
    </main>
  );
}