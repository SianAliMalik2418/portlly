# Portlly

Portlly is a TanStack Start app for small browser games. The MVP is a
Semantle-style word game powered by static puzzle files generated offline.

## Stack

- TanStack Start, React 19, Vite, TypeScript
- Tailwind CSS 4 via `@tailwindcss/vite`
- shadcn/ui components in `src/components/ui`
- Bun for local scripts
- Cloudflare Workers and R2 for deployment and puzzle file hosting

## Scripts

```bash
bun run dev
bun run build
bun run lint
bun run format
bun run check
bun run typecheck
bun run preprocess:smoke
bun run preprocess:puzzles
bun run cf-typegen
bun run r2:upload:local
bun run r2:create-bucket
bun run r2:upload
bun run deploy
```

## Folder Conventions

- `src/routes/` - TanStack Router file-based routes.
- `src/games/semantic-guess/` - Semantic Guess route entry, React UI, browser
  hooks, pure engine, reducer, data access, and game-only utilities.
- `src/features/home/` - platform landing page, game catalog, and the games
  registry used by `/`.
- `src/lib/` - shared utilities that are not tied to a single game.
- `src/components/ui/` - generated shadcn/ui primitives. Treat these as vendor-style
  generated code and keep app-specific composition outside this folder.
- `scripts/preprocess/` - Python preprocessing pipeline for GloVe vocabulary and
  puzzle JSON generation.
- `data/` - local-only intermediate artifacts such as downloaded embeddings,
  generated word lists, and scratch preprocessing outputs. This directory is
  gitignored.
- `dist/puzzles/` - generated puzzle artifacts before upload to R2. Build output
  under `dist/` is gitignored.

## Environment

Copy `.env.example` to `.env.local` for local-only values. Do not commit real
secrets, downloaded embeddings, or generated large data files.

## Phase 0 Baseline

Tailwind is wired through `vite.config.ts` and `src/styles.css`. ESLint and
Prettier are configured for project-owned source. Generated shadcn primitives,
TanStack route output, local skill templates, build output, and local data are
excluded from baseline formatting/linting so the commands stay stable.

## Phase 1 Preprocessing

The word game uses static puzzle JSON generated offline. Set up the isolated
Python environment before running the full pipeline:

```bash
python3 -m venv scripts/preprocess/.venv
scripts/preprocess/.venv/bin/python -m pip install -r scripts/preprocess/requirements.txt
```

Use `bun run preprocess:smoke` for a tiny no-network fixture run. Use
`bun run preprocess:puzzles` for production artifacts; it downloads and verifies
GloVe 6B 300d, builds `guess_set.txt`, drafts `answer_candidates.txt` from a
curated seed list plus frequency heuristics, drafts `answer_set.txt`, and writes
hashed puzzle files plus local manifests to
`dist/puzzles/`.

Review `data/preprocess/answer_set.txt` manually before production upload. That
file is intentionally generated from heuristics first, then narrowed to roughly
200 fair daily answers by a human pass. Puzzle JSON never includes the plaintext
answer; the answer is omitted from score/rank maps and checked later by hash.

## Phase 2 R2 Data Access

Cloudflare is wired through the official Vite plugin in `vite.config.ts`.
`wrangler.toml` binds the R2 bucket as `PUZZLE_BUCKET` and uses
`@tanstack/react-start/server-entry` for the Worker entry.

Puzzle artifacts are uploaded to R2 with:

- `puzzles/<hashed-file>.json` - immutable puzzle files, served by
  `GET /puzzles/$fileName` with one-year immutable cache headers.
- `manifests/daily_manifest.json` and `manifests/puzzle_index.json` - private
  lookup files used only server-side by `GET /api/puzzles/today`.

The client should use `getTodaysPuzzle()` from
`src/games/semantic-guess/data/puzzle.ts`.
That function fetches `/api/puzzles/today`; the Worker resolves the current UTC
date to a single `puzzleId`, redirects to that hashed file, and never exposes the
future date-to-file map to the browser.

### Generating puzzles (first time only)

Set up the Python environment and run the full preprocessing pipeline:

```bash
python3 -m venv scripts/preprocess/.venv
scripts/preprocess/.venv/bin/python -m pip install -r scripts/preprocess/requirements.txt
bun run preprocess:puzzles
```

This downloads GloVe 6B 300d (~860 MB, cached in `data/`), builds a ~50k-word
guess vocabulary, generates ~200 puzzle JSON files, and writes everything to
`dist/puzzles/`. Review `data/preprocess/answer_set.txt` before production
upload — it is the one manual eyeball step.

For a quick smoke test with a tiny vocabulary (no network required):

```bash
bun run preprocess:smoke
```

### Uploading to local R2

```bash
bun run r2:upload:local
bun run dev
curl -L http://127.0.0.1:3000/api/puzzles/today
```

If Vite selects another port, use the printed local URL. Local R2 data is stored
under `.wrangler/state` and is gitignored. Local uploads use Miniflare to write
directly to `.wrangler/state/v3`.

### Uploading to remote R2 (production)

1. Create an R2 API token at **Cloudflare Dashboard → R2 → Manage R2 API
   Tokens**. Select S3 Auth and grant read/write on the `portlly-puzzles`
   bucket.

2. Set the required environment variables (or add them to `.env.local`):

```bash
export CLOUDFLARE_ACCOUNT_ID=<your account id>
export R2_ACCESS_KEY_ID=<token access key>
export R2_SECRET_ACCESS_KEY=<token secret key>
```

3. Create the bucket (first time only) and upload:

```bash
bun run r2:create-bucket
bun run r2:upload
```

Remote uploads use `@aws-sdk/client-s3` with 10 parallel connections. Both local
and remote uploads are idempotent: they overwrite the same keys and only upload
files listed in `puzzle_index.json`, so stale local puzzle files are never pushed
accidentally.

## Phase 5 Persistence

Semantic Guess persists browser progress locally and never sends it to the
server. On first visit the client mints a local `portlly:anon_id` so future
account-linking or stats can attach to the same browser without changing the
current gameplay flow. Guesses and solved state are stored per puzzle at
`portlly:semantic-guess:<puzzleId>`, so a new daily puzzle starts clean while
refreshing the current puzzle restores progress.

If `localStorage` is unavailable or blocked, the game falls back to in-memory
state for the current tab session.

## Phase 6 Platform Shell

The platform front door lives at `/` and renders the catalog from
`src/features/home/lib/games.ts`. Shared page chrome starts with
`src/components/platform-header.tsx`, while each game keeps its gameplay UI,
browser hooks, pure logic, and data access under `src/games/<game-id>/`.

To add game #2:

1. Create `src/games/<game-id>/` for the game entry component, React
   components, hooks, pure engine, state, data access, and tests. Keep browser
   APIs out of the pure engine/state modules so the logic can run server-side
   later.
2. Add `src/routes/games/<game-id>.tsx` and render the game entry component
   from that route.
3. Add one entry to the `games` registry in `src/features/home/lib/games.ts`
   with `id`, `category`, `name`, `status`, `href`, `description`, and `meta`.
4. Reuse shared utilities from `src/lib/` only when they are game-agnostic.
   Game-specific normalization, scoring, persistence, or hashing belongs under
   that game's folder.
5. Add focused unit tests for the pure game logic and an e2e smoke path once the
   route is playable.
