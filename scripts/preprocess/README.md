# Puzzle Preprocessing

Phase 1 builds local-only vocabulary files and static puzzle JSON files for the
Semantle-style word game. Tickr uses a separate trivia harvester in this same
directory. The app never computes embeddings or calls third-party question APIs
at runtime.

## Setup

```bash
python3 -m venv scripts/preprocess/.venv
scripts/preprocess/.venv/bin/python -m pip install -r scripts/preprocess/requirements.txt
```

The full pipeline expects `numpy`. A small smoke run can execute without it.

## Commands

```bash
# Fast local verification with tiny fixtures, no network and no numpy required.
bun run preprocess:smoke

# Full pipeline. Downloads GloVe 6B and the English word list if missing.
bun run preprocess:puzzles

# Tickr smoke fixtures. No network.
bun run preprocess:tickr:smoke

# Tickr full trivia harvest from OpenTDB.
bun run preprocess:tickr
```

Generated files are intentionally local-only:

- `data/preprocess/cache/` - downloaded GloVe zip, extracted vectors, word list.
- `data/preprocess/guess_set.txt` - accepted guess vocabulary.
- `data/preprocess/answer_candidates.txt` - heuristic answer candidate pool.
- `data/preprocess/answer_set.txt` - production answer list used by generation.
- `dist/puzzles/` - generated puzzle files and local manifests.
- `dist/tickr-smoke/` - deterministic Tickr smoke question buckets.
- `dist/tickr/` - production Tickr question buckets.

Both `data/` and `dist/` are gitignored.

## Manual Answer Review

The pipeline drafts `answer_candidates.txt` from `answer_seed.txt` plus a
frequency heuristic, then drafts `answer_set.txt` when no answer set exists.
Review this file before uploading or releasing production puzzles:

1. Remove abstract/function words, offensive words, obscure words, proper names,
   and terms that do not feel like fair daily answers.
2. Keep roughly 200 concrete nouns, verbs, and adjectives for the MVP.
3. Re-run `bun run preprocess:puzzles`; the generator preserves an existing
   `answer_set.txt` unless `--force-wordlists` is passed.

This is the only manual step in Phase 1.

## Puzzle File Shape

Each puzzle file is keyed by a stable `puzzleId` and written with a hashed file
name derived from the puzzle ID and secret. Puzzle JSON includes:

- `puzzleId`
- `answerHash`
- `scores`
- `ranks`

The plaintext answer is deliberately omitted from `scores` and `ranks`, even
though it is in the local `answer_set.txt`. Win detection must compare the
normalized guess hash with `answerHash`.

## Tickr Question File Shape

Tickr writes one JSON array per difficulty bucket:

- `easy.json`
- `medium.json`
- `hard.json`

Each question includes:

- `id`
- `question`
- `correct`
- `options` (exactly four strings)
- `category`
- `difficulty`

The Tickr harvester keeps only OpenTDB multiple-choice questions, decodes HTML
entities, dedupes by question text, filters over-long questions/answers, and
uses a session token to avoid duplicate API responses during a harvest.
