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
