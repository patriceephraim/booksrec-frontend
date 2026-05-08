"use client";
import { SaveButton } from "@/components/save-button";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { recommendBooks, APIError } from "@/lib/api";
import {
  GENRES,
  MOODS,
  LENGTHS,
  type Genre,
  type Mood,
  type Length,
  type BookRecommendation,
  type QuizAnswers,
} from "@/lib/types";

// --- 1. State shape and initial values --------------------------------------

type QuizState = {
  favoriteBooksRaw: string;
  preferredGenres: Genre[];
  mood: Mood | "";
  lengthPreference: Length | "";
  avoidRaw: string;
};

const INITIAL: QuizState = {
  favoriteBooksRaw: "",
  preferredGenres: [],
  mood: "",
  lengthPreference: "",
  avoidRaw: "",
};

const TOTAL_STEPS = 5;

const STEP_TITLES = [
  "Books you've loved",
  "Genres you enjoy",
  "Your mood right now",
  "Length preference",
  "Anything to avoid?",
];

// --- 2. Component ----------------------------------------------------------

export default function QuizPage() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<QuizState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BookRecommendation[] | null>(null);

  const canAdvance = (() => {
    switch (step) {
      case 1:
        return parseList(state.favoriteBooksRaw).length > 0;
      case 2:
        return state.preferredGenres.length > 0;
      case 3:
        return state.mood !== "";
      case 4:
        return state.lengthPreference !== "";
      case 5:
        return true;
      default:
        return false;
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

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    const quiz: QuizAnswers = {
      favorite_books: parseList(state.favoriteBooksRaw).slice(0, 5),
      preferred_genres: state.preferredGenres,
      mood: state.mood as Mood,
      length_preference: state.lengthPreference as Length,
      avoid: parseList(state.avoidRaw),
    };

    try {
      const data = await recommendBooks(quiz);
      setResults(data.recommendations);
    } catch (e) {
      if (e instanceof APIError) {
        setError("Error " + e.status + ": " + e.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (results) {
    return (
      <Results
        books={results}
        onRetake={() => {
          setResults(null);
          setState(INITIAL);
          setStep(1);
        }}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Find your next book</h1>
        <Progress value={(step / TOTAL_STEPS) * 100} />
        <p className="text-sm text-muted-foreground">
          Step {step} of {TOTAL_STEPS}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{STEP_TITLES[step - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="favs">
                List 1 to 5 books you have loved (one per line)
              </Label>
              <Textarea
                id="favs"
                rows={5}
                placeholder={"Project Hail Mary\nThe Martian\nDune"}
                value={state.favoriteBooksRaw}
                onChange={(e) =>
                  setState({ ...state, favoriteBooksRaw: e.target.value })
                }
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Pick the genres you enjoy</Label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const selected = state.preferredGenres.includes(g);
                  return (
                    <Badge
                      key={g}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer text-sm py-2 px-3"
                      onClick={() => toggleGenre(g)}
                    >
                      {g.replace("_", " ")}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>What is your reading mood?</Label>
              <Select
                value={state.mood}
                onValueChange={(v) => setState({ ...state, mood: v as Mood })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label>How long do you want it?</Label>
              <Select
                value={state.lengthPreference}
                onValueChange={(v) =>
                  setState({ ...state, lengthPreference: v as Length })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a length" />
                </SelectTrigger>
                <SelectContent>
                  {LENGTHS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-2">
              <Label htmlFor="avoid">
                Anything to avoid? (optional, one per line)
              </Label>
              <Textarea
                id="avoid"
                rows={3}
                placeholder={"sad endings\nover 600 pages"}
                value={state.avoidRaw}
                onChange={(e) =>
                  setState({ ...state, avoidRaw: e.target.value })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || loading}
        >
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Finding books..." : "Get recommendations"}
          </Button>
        )}
      </div>
    </main>
  );
}

function parseList(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// --- Results component -----------------------------------------------------

function Results({
  books,
  onRetake,
}: {
  books: BookRecommendation[];
  onRetake: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your recommendations</h1>
        <Button variant="outline" onClick={onRetake}>
          Retake quiz
        </Button>
      </header>

      <div className="grid gap-4">
        {books.map((b, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-baseline justify-between">
                <CardTitle>{b.title}</CardTitle>
                <span className="text-sm text-muted-foreground">{b.year}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {b.author} &middot; {b.genre}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{b.why_recommended}</p>
              <div className="flex items-center justify-between">
                <a
                  href={b.goodreads_search_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium underline underline-offset-4"
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
  );
}