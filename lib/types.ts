/**
 * Frontend types — mirror the Pydantic models in booksrec-backend/app/models.py.
 *
 * Why duplicate them? The backend is the source of truth, but TypeScript
 * needs its own definitions for compile-time checking. In bigger projects
 * you'd use a tool like openapi-typescript to auto-generate these from
 * the FastAPI schema. For now, manual is fine — it's 30 lines.
 */

export const GENRES = [
  "fiction",
  "nonfiction",
  "scifi",
  "fantasy",
  "mystery",
  "biography",
  "history",
  "self_help",
  "romance",
  "literary",
] as const;

export const MOODS = ["light", "deep", "escapist", "challenging", "comforting"] as const;

export const LENGTHS = ["short", "medium", "long", "no_preference"] as const;

export type Genre = (typeof GENRES)[number];
export type Mood = (typeof MOODS)[number];
export type Length = (typeof LENGTHS)[number];

export type QuizAnswers = {
  favorite_books: string[];
  preferred_genres: Genre[];
  mood: Mood;
  length_preference: Length;
  avoid: string[];
};

export type BookRecommendation = {
  title: string;
  author: string;
  year: number;
  genre: string;
  why_recommended: string;
  goodreads_search_url: string;
};

export type RecommendationResponse = {
  recommendations: BookRecommendation[];
};