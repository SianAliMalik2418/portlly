# Nearo

A Semantle-style daily word game. Guess the hidden word by meaning — each guess gets a similarity score (0-100) and a rank when close.

## How It Works

Players guess words and receive:
- **Score (0-100%):** cosine similarity between guess and answer (GloVe embeddings)
- **Rank (#N):** position within the top-N closest words (only shown when in the "warm band")
- **Win:** guess the exact word (score = 100, rank = 1)

Puzzles are static JSON files generated offline. No runtime AI or server-side scoring.

## Modes

- **Daily** (`/games/nearo`) — one puzzle per day, shared across all players
- **Archive** (`/games/nearo/archive/$date`) — replay past puzzles (last 7 days)

## Configuration

```typescript
// config.ts
{
  id: "nearo",
  name: "Nearo",
  route: "/games/nearo",
  archiveRoute: "/games/nearo/archive",
  storagePrefix: "portlly:nearo",
  hintThreshold: 10,  // Earn 1 hint per 10 guesses
  maxHints: 5,        // Maximum 5 hints total per puzzle
}
```

## Architecture

```
nearo/
├── nearo.tsx              # Entry component — layout orchestration
├── config.ts              # Tuning params and metadata
├── types.ts               # WordGuess, WordPuzzle, GameStatus
├── engine.ts              # scoreGuess() — pure, no side effects
├── state.ts               # wordGameReducer — actions: hydrate, reset, submitGuess
├── seo.ts                 # JSON-LD structured data
│
├── components/
│   ├── game-nav.tsx       # Back button, logo, dark mode toggle
│   ├── status-card.tsx    # Best score ring, guess count, status message
│   ├── guess-input.tsx    # Text input + submit + hint button
│   ├── guess-list.tsx     # "Your guesses" section
│   ├── guess-row.tsx      # Individual guess card (rank, word, score)
│   ├── win-view.tsx       # Victory: confetti, stats, countdown, archive list
│   ├── archive-strip.tsx  # Recent puzzles strip (below status card)
│   └── nearo-seo-content.tsx  # Hidden SEO content (definitions, FAQ)
│
├── hooks/
│   ├── use-game-state.ts  # Main game hook (fetch, submit, hint, persist, reset)
│   └── use-game-tour.ts   # First-time onboarding tour (driver.js)
│
├── lib/
│   ├── storage.ts         # localStorage: save/load/clear game state per puzzle
│   ├── hints.ts           # Hint word selection algorithm
│   ├── presentation.ts    # Status messages by score, emoji journey, sort
│   ├── normalize.ts       # Word normalization (lowercase, trim, accents)
│   └── hash.ts            # SHA-256 answer hash comparison
│
├── data/
│   └── puzzle.ts          # API fetch: getTodaysPuzzle, getPuzzleByDate, archive days
│
└── server/
    └── puzzle-r2.ts       # R2 bucket access (server-side only)
```

## Game State Flow

1. **Fetch puzzle** — daily via `/api/puzzles/today`, archive via `/api/puzzles/day?date=...`
2. **Hydrate** — load saved progress from localStorage (if any)
3. **Submit guess** — normalize → score against puzzle → dispatch to reducer
4. **Persist** — save guesses + win state + hints used to localStorage
5. **Win** — delay 380ms → show win view with confetti

## Hint System

- Hints are earned: 1 hint per 10 guesses submitted
- Maximum 5 hints per puzzle
- Hints select strategic words (rank capped at 15 — won't give away the answer)
- Hint words are marked with a lightbulb icon in the guess list
- Clicking hint when unavailable shows a toast with guesses remaining

## Persistence

- Key format: `portlly:nearo:<puzzleId>`
- Stores: guesses array, won boolean, hintsUsed count
- Each puzzle ID gets independent state (daily vs archive are separate)
- Anonymous ID minted at `portlly:anon_id` for future account linking

## Scoring Engine

`engine.ts` exports `scoreGuess(word, puzzle)` which returns:
- `{ status: "unknown", word }` — not in vocabulary
- `{ status: "miss", word, score, rank? }` — valid but not the answer
- `{ status: "win", word, score: 100, rank: 1 }` — correct answer (by hash match)

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/puzzles/today` | Resolve today's UTC date → puzzle file redirect |
| `GET /api/puzzles/day?date=YYYY-MM-DD` | Resolve specific date → puzzle file |
| `GET /api/puzzles/archive` | List available archive dates with puzzle IDs |
| `GET /puzzles/:fileName` | Serve immutable puzzle JSON from R2 |

## Testing

- **Unit tests:** `engine.test.ts`, `state.test.ts`, `lib/*.test.ts`
- **E2E tests:** `tests/e2e/nearo.spec.ts` (18 tests covering all user flows)

Run:
```bash
bun run test                           # Unit tests
bunx playwright test nearo.spec.ts     # E2E tests
```

E2E tests use a smoke puzzle set with deterministic vocabulary (answer: "water", known ranks/scores).
