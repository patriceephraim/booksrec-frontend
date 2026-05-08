/**
 * API client — talks to the FastAPI backend.
 *
 * The Clerk session token is passed in by callers (they get it from
 * useAuth().getToken()). Keeping fetch logic separate from component code
 * means tests can mock it, and we have one place to change if the auth
 * scheme ever changes.
 */

import type { QuizAnswers, RecommendationResponse, BookRecommendation } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {},
): Promise<T> {
  const { method = "GET", token, body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new APIError(res.status, `${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// --- Public API ----------------------------------------------------------

export function recommendBooks(quiz: QuizAnswers): Promise<RecommendationResponse> {
  // /api/recommend is public on the backend — no token needed yet.
  return request<RecommendationResponse>("/api/recommend", {
    method: "POST",
    body: quiz,
  });
}

export function saveBook(book: BookRecommendation, token: string): Promise<{ saved: unknown }> {
  return request("/api/save", { method: "POST", token, body: book });
}

export function listSavedBooks(token: string): Promise<{ books: unknown[] }> {
  return request("/api/saved", { method: "GET", token });
}