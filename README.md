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
- `src/games/word/` - word-game-specific UI, engine, reducer, and data access.
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

The client should use `getTodaysPuzzle()` from `src/games/word/data/puzzle.ts`.
That function fetches `/api/puzzles/today`; the Worker resolves the current UTC
date to a single `puzzleId`, redirects to that hashed file, and never exposes the
future date-to-file map to the browser.

Local verification:

```bash
bun run preprocess:puzzles
bun run r2:upload:local
bun run dev
curl -L http://127.0.0.1:3000/api/puzzles/today
```

If Vite selects another port, use the printed local URL. Local R2 data is stored
under `.wrangler/state` and is gitignored.

Remote Cloudflare setup requires an Account API token with R2 and Workers write
permissions:

```bash
export CLOUDFLARE_API_TOKEN=...
bun run r2:create-bucket
bun run r2:upload
```

`r2:upload` is idempotent: it overwrites the same keys and uploads only files
listed by the current `puzzle_index.json`, so stale local puzzle files are not
pushed accidentally. The script passes `--remote` for `r2:upload`; use
`r2:upload:local` only for local Wrangler R2 state.
