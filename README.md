# Portlyy

A platform of small, polished browser games at [portlyy.com](https://portlyy.com). Each game is a self-contained module under one codebase — daily puzzles, party games, and solo challenges.

## Live Games

| Game      | Type              | Mode            | Route          |
| --------- | ----------------- | --------------- | -------------- |
| **Nearo** | Word / Similarity | Daily + Archive | `/games/nearo` |

## Upcoming

| Game        | Type   | Mode |
| ----------- | ------ | ---- |
| Answer game | Trivia |

## Tech Stack

- **Framework:** TanStack Start (React 19, Vite, file-based routing)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui, Framer Motion
- **State:** TanStack Query, React reducers, localStorage persistence
- **Hosting:** Cloudflare Workers + R2 (puzzle/asset storage)
- **Testing:** Vitest (unit), Playwright (E2E)
- **Tooling:** Bun, ESLint, Prettier
- **Preprocessing:** Python (offline puzzle generation from GloVe embeddings)

## Project Structure

```
src/
├── routes/                  # TanStack Router file-based routes
│   ├── index.tsx            # Platform landing page
│   ├── games/
│   │   ├── nearo.tsx        # Nearo daily route
│   │   └── nearo/archive/   # Nearo archive routes
│   ├── api/puzzles/         # Server-side puzzle resolution
│   └── sitemap[.]xml.ts    # Dynamic sitemap
├── games/
│   ├── nearo/               # Game module (see src/games/nearo/README.md)
│   └── tickr/               # Game module (see src/games/tickr/README.md)
├── features/
│   └── home/                # Landing page, game catalog, registry
├── components/
│   ├── ui/                  # shadcn/ui primitives (vendor-style, don't edit)
│   ├── platform-header.tsx  # Shared header
│   └── mode-toggle.tsx      # Dark/light mode
├── lib/                     # Shared utilities (score-color, seo, utils)
└── styles.css               # Tailwind entry

scripts/
├── preprocess/              # Python pipeline for puzzle generation
└── r2/                      # R2 upload scripts (local + remote)

tests/
└── e2e/                     # Playwright E2E tests

data/                        # Local-only artifacts (gitignored)
dist/                        # Build output + puzzle artifacts (gitignored)
```

## Game Module Convention

Each game lives at `src/games/<game-id>/` with this structure:

```
src/games/<game-id>/
├── <game-id>.tsx            # Entry component (rendered by route)
├── config.ts                # Game metadata (id, name, routes, tuning params)
├── types.ts                 # Game-specific types
├── engine.ts                # Pure scoring/logic (no browser APIs)
├── state.ts                 # Reducer / state machine
├── components/              # UI components
├── hooks/                   # React hooks (game state, tours, etc.)
├── lib/                     # Utilities (storage, normalization, hints)
├── data/                    # Data fetching (API calls, query options)
├── server/                  # Server-side logic (R2 access, etc.)
├── seo.ts                   # Structured data / SEO schema
└── *.test.ts                # Unit tests for engine/state/lib
```

Rules:

- Keep browser APIs out of `engine.ts` and `state.ts` so logic can run server-side
- Game-specific storage, normalization, and hashing stay in the game folder
- Only promote to `src/lib/` if truly game-agnostic
- Every game must maintain its own `README.md` at
  `src/games/<game-id>/README.md`, modeled after Nearo's README. Update it
  whenever architecture, commands, data shape, persistence, routes, or gameplay
  behavior changes.

## Scripts

```bash
# Development
bun run dev              # Start dev server (Vite + Cloudflare local)
bun run build            # Production build
bun run typecheck        # TypeScript check

# Quality
bun run lint             # ESLint
bun run format           # Prettier
bun run check            # lint + format check

# Testing
bun run test             # Vitest unit tests
bunx playwright test     # E2E tests (starts dev server automatically)

# Puzzle Pipeline
bun run preprocess:smoke    # Tiny fixture puzzles (no network)
bun run preprocess:puzzles  # Full production puzzles (downloads GloVe)
bun run preprocess:tickr:smoke # Tiny Tickr trivia fixtures (no network)
bun run preprocess:tickr       # Full Tickr OpenTDB trivia harvest

# R2 / Deployment
bun run r2:upload:local  # Upload puzzles to local Miniflare R2
bun run r2:upload:tickr:local # Upload Tickr buckets to local Miniflare R2
bun run r2:create-bucket # Create remote R2 bucket (first time)
bun run r2:upload        # Upload puzzles to production R2
bun run r2:upload:tickr  # Upload Tickr buckets to production R2
bun run deploy           # Deploy to Cloudflare Workers
```

## Local Development

```bash
# 1. Install dependencies
bun install

# 2. Generate puzzle fixtures for local play
bun run preprocess:smoke

# 3. Upload to local R2 (Miniflare)
bun run r2:upload:local

# 4. Start dev server
bun run dev
```

The app runs at `http://localhost:3000`. Local R2 state lives in `.wrangler/state/` (gitignored).

## Deployment

The app deploys to Cloudflare Workers with R2 for puzzle storage.

### First-time setup

1. Create an R2 API token at **Cloudflare Dashboard > R2 > Manage R2 API Tokens** (S3 Auth, read/write on `portlly-puzzles`)

2. Set environment variables (or `.env.local`):

   ```bash
   export CLOUDFLARE_ACCOUNT_ID=<account-id>
   export R2_ACCESS_KEY_ID=<key>
   export R2_SECRET_ACCESS_KEY=<secret>
   ```

3. Create bucket and upload puzzles:

   ```bash
   bun run r2:create-bucket
   bun run preprocess:puzzles
   bun run r2:upload
   ```

4. Deploy:
   ```bash
   bun run deploy
   ```

### Routine deploys

```bash
bun run build && bun run deploy
```

Puzzle uploads are idempotent — only files in `puzzle_index.json` get pushed.

## SEO

- Dynamic `sitemap.xml` generated at build time
- Structured data (JSON-LD) per game: VideoGame, HowTo, FAQ, BreadcrumbList
- Archive pages are `noindex` to avoid thin content duplication
- Each game exports its own SEO schema from `seo.ts`

## Adding a New Game — Checklist

1. **Create game module** at `src/games/<game-id>/` following the convention above
2. **Add route** at `src/routes/games/<game-id>.tsx`
3. **Register in catalog** — add entry to `src/features/home/lib/games.ts`
4. **Add config** with id, name, route, category, glyph, status, description, meta
5. **Implement engine** — pure scoring/logic, no browser deps
6. **Implement state** — reducer with hydrate/reset/submit actions
7. **Implement persistence** — localStorage keyed by `portlly:<game-id>:<puzzle-id>`
8. **Add SEO** — structured data schema in `seo.ts`
9. **Add unit tests** — engine, state, and lib modules
10. **Add E2E tests** — core flows in `tests/e2e/<game-id>.spec.ts`
11. **Update sitemap** — include new route
12. **Add and maintain game README** — at
    `src/games/<game-id>/README.md`; keep it current as the game evolves

## Environment

Copy `.env.example` to `.env.local` for local values. Never commit secrets, embeddings, or generated data.

## Preprocessing (Puzzle Generation)

Games that use offline-generated puzzles share a Python pipeline:

```bash
python3 -m venv scripts/preprocess/.venv
source scripts/preprocess/.venv/bin/activate
pip install -r scripts/preprocess/requirements.txt
```

- `bun run preprocess:smoke` — tiny fixture set, no network, for tests
- `bun run preprocess:puzzles` — full pipeline (GloVe 6B 300d, ~50k vocab, ~200 puzzles)
- `bun run preprocess:tickr:smoke` — tiny Tickr question buckets, no network
- `bun run preprocess:tickr` — full Tickr OpenTDB harvest into difficulty buckets

Puzzle JSON never contains plaintext answers. Win detection uses answer hash comparison client-side.
