"use client";

/**
 * Client-side hook for calling protected backend endpoints.
 *
 * Wraps the API functions in lib/api.ts and injects the Clerk JWT
 * automatically. Components stay clean — they just call save() or list()
 * without thinking about tokens.
 */

import { useAuth } from "@clerk/nextjs";
import { saveBook, listSavedBooks } from "./api";
import type { BookRecommendation } from "./types";

export function useAuthedApi() {
  const { getToken } = useAuth();

  async function save(book: BookRecommendation) {
    const token = await getToken();
    if (!token) throw new Error("Not signed in");
    return saveBook(book, token);
  }

  async function listSaved() {
    const token = await getToken();
    if (!token) throw new Error("Not signed in");
    return listSavedBooks(token);
  }

  return { save, listSaved };
}