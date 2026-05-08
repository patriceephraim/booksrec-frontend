export const GENRES = [
  "fiction", "nonfiction", "scifi", "fantasy", "mystery",
  "biography", "history", "self_help", "romance", "literary",
] as const;

export const MOODS = ["light", "deep", "escapist", "challenging", "comforting"] as const;

export const LENGTHS = ["short", "medium", "long", "no_preference"] as const;

export const THEMES = [
  "adventure", "love & romance", "identity", "family", "survival",
  "politics", "philosophy", "humor", "dark & gritty", "coming of age",
  "spirituality", "nature & the wild",
] as const;

export const READING_STYLES = [
  { value: "character_driven", label: "Character-driven" },
  { value: "plot_driven",      label: "Plot-driven" },
  { value: "no_preference",    label: "No preference" },
] as const;

export type Genre = (typeof GENRES)[number];
export type Mood  = (typeof MOODS)[number];
export type Length = (typeof LENGTHS)[number];
export type Theme = (typeof THEMES)[number];

export type QuizAnswers = {
  favorite_books: string[];
  preferred_genres: Genre[];
  themes: string[];
  reading_style: string;
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
