"use client";

import { SaveButton } from "@/components/save-button";
import { BookCover } from "@/components/book-cover";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { recommendBooks, APIError } from "@/lib/api";
import {
  GENRES, MOODS, LENGTHS, THEMES, READING_STYLES,
  type Genre, type Mood, type Length, type BookRecommendation, type QuizAnswers,
} from "@/lib/types";

const TOTAL_STEPS = 7;

const STEP_TITLES = [
  "Any books you've loved?",
  "Genres you enjoy",
  "Themes that interest you",
  "Your mood right now",
  "How do you like your stories?",
  "Length preference",
  "Anything to avoid?",
];

const LS_KEY         = "booksrec_last_quiz";
const LS_RESULTS_KEY = "booksrec_last_results";

type QuizState = {
  favoriteBooksRaw: string;
  preferredGenres: Genre[];
  themes: string[];
  mood: Mood | "";
  readingStyle: string;
  lengthPreference: Length | "";
  avoidRaw: string;
};

const INITIAL: QuizState = {
  favoriteBooksRaw: "",
  preferredGenres: [],
  themes: [],
  mood: "",
  readingStyle: "",
  lengthPreference: "",
  avoidRaw: "",
};

function stateToAnswers(s: QuizState): QuizAnswers {
  return {
    favorite_books: parseList(s.favoriteBooksRaw).slice(0, 5),
    preferred_genres: s.preferredGenres,
    themes: s.themes,
    reading_style: s.readingStyle || "no_preference",
    mood: s.mood as Mood,
    length_preference: s.lengthPreference as Length,
    avoid: parseList(s.avoidRaw),
  };
}

function parseList(raw: string): string[] {
  return raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
}

export default function QuizPage() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<QuizState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BookRecommendation[] | null>(null);
  const [lastAnswers, setLastAnswers] = useState<QuizAnswers | null>(null);

  // Load last quiz answers from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setLastAnswers(JSON.parse(saved));
    } catch {}
  }, []);

  const canAdvance = (() => {
    switch (step) {
      case 1: return true; // optional
      case 2: return state.preferredGenres.length > 0;
      case 3: return true; // optional
      case 4: return state.mood !== "";
      case 5: return state.readingStyle !== "";
      case 6: return state.lengthPreference !== "";
      case 7: return true;
      default: return false;
    }
  })();

  function toggleGenre(g: Genre) {
    setState((s) => ({
      ...s,
      preferredGenres: s.preferredGenres.includes(g)
        ? s.preferredGenres.filter((x) => x !== g)
        : [...s.preferredGenres, g],
    }));
  }

  function toggleTheme(t: string) {
    setState((s) => ({
      ...s,
      themes: s.themes.includes(t)
        ? s.themes.filter((x) => x !== t)
        : [...s.themes, t],
    }));
  }

  async function submitAnswers(answers: QuizAnswers) {
    setError(null);
    setLoading(true);
    try {
      const data = await recommendBooks(answers);
      setLastAnswers(answers);
      localStorage.setItem(LS_KEY, JSON.stringify(answers));
      localStorage.setItem(LS_RESULTS_KEY, JSON.stringify(data.recommendations));
      setResults(data.recommendations);
    } catch (e) {
      setError(e instanceof APIError ? `Error ${e.status}: ${e.message}` : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    await submitAnswers(stateToAnswers(state));
  }

  async function handleGetNewPicks() {
    if (!lastAnswers) return;
    await submitAnswers(lastAnswers);
  }

  if (results) {
    return (
      <Results
        books={results}
        loading={loading}
        onRetake={() => { setResults(null); setState(INITIAL); setStep(1); }}
        onGetNewPicks={lastAnswers ? handleGetNewPicks : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 pt-6 sm:p-6 sm:pt-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold text-white">Find your next book</h1>
          <Progress value={((step - 1) / TOTAL_STEPS) * 100} className="h-1.5" />
          <p className="text-sm text-white/40">Step {step} of {TOTAL_STEPS}</p>
        </header>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{STEP_TITLES[step - 1]}</CardTitle>
            {step === 1 && (
              <p className="text-sm text-white/40">Optional — skip if you&apos;re new to reading</p>
            )}
            {step === 3 && (
              <p className="text-sm text-white/40">Optional — pick as many as you like</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Step 1 — Favourite books (optional) */}
            {step === 1 && (
              <div className="space-y-2">
                <Label className="text-white/70">List up to 5 books (one per line)</Label>
                <Textarea
                  rows={5}
                  placeholder={"Project Hail Mary\nThe Martian\nDune"}
                  value={state.favoriteBooksRaw}
                  onChange={(e) => setState({ ...state, favoriteBooksRaw: e.target.value })}
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-violet-500"
                />
              </div>
            )}

            {/* Step 2 — Genres */}
            {step === 2 && (
              <div className="space-y-3">
                <Label className="text-white/70">Pick at least one</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => {
                    const selected = state.preferredGenres.includes(g);
                    return (
                      <Badge
                        key={g}
                        onClick={() => toggleGenre(g)}
                        className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                          selected
                            ? "bg-violet-600 hover:bg-violet-700 text-white border-transparent"
                            : "border-white/20 text-white/60 hover:border-violet-500 hover:text-white bg-transparent"
                        }`}
                      >
                        {g.replace("_", " ")}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 — Themes (optional) */}
            {step === 3 && (
              <div className="space-y-3">
                <Label className="text-white/70">What themes speak to you?</Label>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => {
                    const selected = state.themes.includes(t);
                    return (
                      <Badge
                        key={t}
                        onClick={() => toggleTheme(t)}
                        className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                          selected
                            ? "bg-violet-600 hover:bg-violet-700 text-white border-transparent"
                            : "border-white/20 text-white/60 hover:border-violet-500 hover:text-white bg-transparent"
                        }`}
                      >
                        {t}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4 — Mood */}
            {step === 4 && (
              <div className="space-y-3">
                <Label className="text-white/70">How do you want to feel while reading?</Label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "light",       label: "Light & fun",          desc: "Easy to read, makes me smile" },
                    { value: "deep",        label: "Deep & thoughtful",    desc: "Something that makes me think" },
                    { value: "escapist",    label: "Pure escape",          desc: "I want to forget my real life completely" },
                    { value: "challenging", label: "A real challenge",     desc: "Push me intellectually or emotionally" },
                    { value: "comforting",  label: "Warm & comforting",    desc: "Something safe and feel-good" },
                  ].map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => setState({ ...state, mood: value as Mood })}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        state.mood === value
                          ? "border-violet-500 bg-violet-600/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span className="font-medium text-white">{label}</span>
                      <span className="ml-2 text-white/40">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 — Reading style */}
            {step === 5 && (
              <div className="space-y-3">
                <Label className="text-white/70">What kind of story do you prefer?</Label>
                <div className="flex flex-col gap-2">
                  {READING_STYLES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setState({ ...state, readingStyle: value })}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        state.readingStyle === value
                          ? "border-violet-500 bg-violet-600/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                      {value === "character_driven" && (
                        <span className="ml-2 text-white/40">— you care more about the people than the plot</span>
                      )}
                      {value === "plot_driven" && (
                        <span className="ml-2 text-white/40">— you want a gripping story that pulls you forward</span>
                      )}
                      {value === "no_preference" && (
                        <span className="ml-2 text-white/40">— either works for you</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6 — Length */}
            {step === 6 && (
              <div className="space-y-2">
                <Label className="text-white/70">How long do you want it?</Label>
                <Select
                  value={state.lengthPreference}
                  onValueChange={(v) => setState({ ...state, lengthPreference: v as Length })}
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Pick a length" />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((l) => (
                      <SelectItem key={l} value={l}>{l.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 7 — Avoid (optional) */}
            {step === 7 && (
              <div className="space-y-2">
                <Label className="text-white/70">Anything to avoid? (optional, one per line)</Label>
                <Textarea
                  rows={3}
                  placeholder={"sad endings\nover 600 pages\ntoo much violence"}
                  value={state.avoidRaw}
                  onChange={(e) => setState({ ...state, avoidRaw: e.target.value })}
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-violet-500"
                />
              </div>
            )}

          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || loading}
            className="text-white/50 hover:text-white hover:bg-white/10"
          >
            Back
          </Button>
          {step < TOTAL_STEPS ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {loading ? "Finding books..." : "Get recommendations"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function Results({
  books, loading, onRetake, onGetNewPicks,
}: {
  books: BookRecommendation[];
  loading: boolean;
  onRetake: () => void;
  onGetNewPicks?: () => void;
}) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 pt-6 sm:p-6 sm:pt-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Your recommendations</h1>
          <div className="flex gap-2">
            {onGetNewPicks && (
              <Button
                onClick={onGetNewPicks}
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {loading ? "Finding..." : "✦ New picks"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onRetake}
              disabled={loading}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Retake quiz
            </Button>
          </div>
        </header>

        <div className="grid gap-4">
          {books.map((b, i) => (
            <Card key={i} className="border-white/10 bg-white/5">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-11">
                    <BookCover title={b.title} author={b.author} genre={b.genre} />
                  </div>
                  <div>
                    <CardTitle className="text-white">{b.title}</CardTitle>
                    <p className="mt-0.5 text-sm text-white/40">
                      {b.author} &middot; {b.genre} &middot; {b.year}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white/70">{b.why_recommended}</p>
                <div className="flex items-center justify-between">
                  <a
                    href={b.goodreads_search_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-violet-400 underline underline-offset-4 hover:text-violet-300"
                  >
                    View on Goodreads &rarr;
                  </a>
                  <SaveButton book={b} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
