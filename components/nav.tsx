"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

/**
 * Top navigation — shown on every protected page.
 *
 * usePathname() tells us which route is active so we can highlight the
 * current link. Lives in components/ (not app/) because it's shared UI,
 * not a route.
 */

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/quiz", label: "Quiz" },
  { href: "/saved", label: "My Books" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/dashboard" className="font-semibold">
          BooksRec
        </Link>

        <div className="flex items-center gap-6">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-sm font-medium text-foreground"
                    : "text-sm text-muted-foreground hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <UserButton />
        </div>
      </div>
    </nav>
  );
}