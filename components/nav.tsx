"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/quiz",      label: "Quiz" },
  { href: "/saved",     label: "My Books" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
          BooksRec
        </Link>

        <div className="flex items-center gap-8">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-sm font-medium text-white"
                    : "text-sm text-white/40 hover:text-white transition-colors"
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
