# booksrec-frontend

url to the app: https://booksrec-frontend.vercel.app

AI-powered book recommendation app. Users sign in, answer a 7-step quiz about their reading preferences, and receive personalized book recommendations. Recommendations can be saved to a personal "My Books" list and unsaved at any time.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI primitives)
- **Clerk v7** — authentication and session management
- **FastAPI backend** (`booksrec-backend`) — AI recommendation engine and saved-books storage

## Project Structure

```
app/
  page.tsx                     # Public landing page
  sign-in/[[...sign-in]]/      # Clerk sign-in
  sign-up/[[...sign-up]]/      # Clerk sign-up
  (app)/
    layout.tsx                 # Shared nav layout for authenticated routes
    dashboard/page.tsx         # Post-login home — last recommendations + stats
    quiz/page.tsx              # 7-step preference quiz + results
    saved/page.tsx             # "My Books" — saved books list
components/
  nav.tsx                      # Top nav
  book-cover.tsx               # Fetches real cover from Google Books API, falls back to gradient
  save-button.tsx              # Save book with idle/saving/saved/error states
  unsave-button.tsx            # Remove a book from My Books
  last-recommendations.tsx     # Reads last quiz results from localStorage for the dashboard
  ui/                          # shadcn/ui primitives
lib/
  api.ts                       # Fetch client for the FastAPI backend
  types.ts                     # TypeScript types (mirrors backend Pydantic models)
  use-authed-api.ts            # Hook that injects Clerk token into API calls
middleware.ts                  # Clerk route protection
public/
  books.png                    # Background image used across all pages
```

## Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Landing page with sign-in / sign-up CTAs |
| `/sign-in` | No | Clerk sign-in |
| `/sign-up` | No | Clerk sign-up |
| `/dashboard` | Yes | Last AI recommendations + Books Saved count |
| `/quiz` | Yes | 7-step quiz → AI recommendations → save books |
| `/saved` | Yes | My Books — all saved books with remove button |

## Quiz Flow

7 steps:

1. **Books you've loved** — optional, up to 5 (skip if new to reading)
2. **Genres** — multi-select badges
3. **Themes** — optional multi-select (adventure, identity, survival, humor, etc.)
4. **Mood** — friendly card selector (Light & fun / Deep & thoughtful / Pure escape / A real challenge / Warm & comforting)
5. **Story style** — Character-driven / Plot-driven / No preference
6. **Length** — short / medium / long / no preference
7. **Anything to avoid** — optional free text

After results, **"✦ New picks"** reruns the same answers for a fresh set without retaking the quiz. Last results are persisted in `localStorage` and shown on the dashboard.

## Getting Started

### Prerequisites

- Node.js 18+
- The `booksrec-backend` FastAPI server running (defaults to `http://localhost:8000`)
- A [Clerk](https://clerk.com) application

### Environment Variables

Create a `.env.local` file:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Commands

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Backend API Contract

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/recommend` | No | Get recommendations from quiz answers |
| `POST` | `/api/save` | Bearer token | Save a book |
| `GET` | `/api/saved` | Bearer token | List saved books |
| `DELETE` | `/api/saved/{id}` | Bearer token | Remove a saved book |

Types are defined in `lib/types.ts` and mirror the backend Pydantic models.
