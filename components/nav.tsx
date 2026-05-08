"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, BookOpen, BookMarked } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Home",     icon: Home },
  { href: "/quiz",      label: "Quiz",     icon: BookOpen },
  { href: "/saved",     label: "My Books", icon: BookMarked },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top nav */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            BooksRec
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-6">
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
            </div>
            <UserButton />
          </div>
        </div>
      </nav>

      {/* Bottom tab bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-white/10 bg-black/70 backdrop-blur-md">
        <div className="flex items-center justify-around py-2">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-6 py-1 transition-colors ${
                  active ? "text-violet-400" : "text-white/40"
                }`}
              >
                <Icon size={20} strokeWidth={1.75} />
                <span className="text-[10px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
