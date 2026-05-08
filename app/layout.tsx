import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "BooksRec",
  description: "AI-powered book recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="antialiased">
          {/* Background image — fixed so it stays put while scrolling */}
          <div className="fixed inset-0 -z-10 bg-[url('/books.png')] bg-cover bg-center bg-no-repeat" />
          {/* Dark overlay for readability */}
          <div className="fixed inset-0 -z-10 bg-black/65" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}