# Build Plan — Fun Games Platform (Game 1: Semantle-style word game)

**For:** Claude Code
**Stack:** TanStack Start (React 19, Vite) · Bun · Tailwind · Cloudflare Workers + R2 · Python (offline preprocessing) · GloVe 6B 300d
**Scope:** MVP — single game, fully client-side, no database, no auth, no server writes.
**Considerations:** Work one phase at a time, before working on the phase, tell the user what will be achieved, how will you do it, if any approach can be improved, and if it does requires user manual work
---

**What we are building:** A platform of simple, fun, no-graphics browser games (think neal.fun / Skribbl / "guess the meme"), where each game is a route under one codebase so we can keep adding games over time.
Game 1 is a Semantle-style daily word game (like logiword.com, better UI/UX): one secret word per day, players guess words and get a similarity score (0–100) plus a rank when they're close, powered by precomputed GloVe word embeddings — no runtime AI, just static lookups.


## Architecture in one paragraph

The game engine is a **static lookup**, not runtime compute. An offline Python pipeline turns GloVe vectors into one JSON "puzzle file" per answer word (similarity score for every word in a ~50k guess vocabulary, plus ranks for the warm band). Those files live on **Cloudflare R2** and are served via CDN. The **TanStack Start** app fetches the day's puzzle file, and all scoring/guessing/progress happens **client-side** with `localStorage`. No DB, no auth in MVP. The platform is structured so each game is a route, and a DB (Neon + Drizzle) slots in later without re-architecting.

---

## Guardrails (apply to every phase)

- **Do not** introduce a database, auth, or any server-side writes. MVP is client-side only.
- **Do not** ship the plaintext answer word in puzzle files. The client detects a win by comparing a **hash of the guess** to a stored answer hash.
- Each game is a **route** under a routes-per-game structure; never hardcode "the word game" as the only game.
- Normalize all guesses: lowercase, trim, strip accents. GloVe is lowercase/uncased — align to it.
- Keep puzzle files immutable-per-day so they're CDN-cacheable.
- **Identify puzzle files by puzzle ID, not by date.** The daily schedule is a separate (date → puzzle ID) mapping layered on top. This keeps daily catch-up/archive dates separate from puzzle storage and local progress.
- **Keep the game engine pure and transport-agnostic** (no browser-only assumptions). The same scoring function must be able to run server-side unchanged — this is what makes future **multiplayer** (authoritative server scoring) possible without a rewrite.
- After each phase, **stop and report** against that phase's "Done when" checklist before continuing.

---

## Phase 0 — Repo hygiene & conventions

**Goal:** A clean, documented baseline before any feature work.

**Tasks**
1. Confirm the existing TanStack Start + Bun project runs (`bun run dev`).
2. Add Tailwind CSS (Vite plugin) and verify a styled element renders.
3. Set up Biome (or ESLint + Prettier) for lint/format; add `bun run lint` and `bun run format`.
4. Establish folder conventions and document them in `README.md`:
   - `src/routes/` — file-based routes (TanStack Router)
   - `src/games/word/` — game-specific components/logic
   - `src/lib/` — shared utils (hashing, normalization, storage)
   - `scripts/preprocess/` — Python pipeline (separate from app)
   - `data/` — local-only intermediate artifacts (gitignored)
5. Add `.env.example` and ensure secrets/large data are gitignored.

**Done when:** dev server runs, Tailwind works, lint/format scripts pass, folder structure documented.

---

## Phase 1 — Offline preprocessing pipeline (Python)

**Goal:** Produce the vocabulary lists and per-puzzle JSON files. This gates everything else — the app is useless without these files.

**Tasks**
1. Set up an isolated Python env in `scripts/preprocess/` (venv or uv), with `numpy` and `gensim` (or pure numpy). Add a `requirements.txt`.
2. **Download GloVe 6B 300d** (`glove.6B.zip` from Stanford NLP), extract `glove.6B.300d.txt`. Script this with a checksum check; cache locally (gitignored — it's large).
3. **Build the guess set (~50k words):**
   - Load GloVe vocab.
   - Intersect with a standard English wordlist (e.g. `words_alpha` / SCOWL).
   - Filter: alphabetic only, length 2–15, drop junk/proper-noun-only tokens.
   - Output `guess_set.txt` (the words a player may type and get scored).
4. **Build the answer set (~200 words):**
   - Take top-frequency English words, filter to concrete nouns/verbs/adjectives, drop function/abstract words → candidate pool (~400).
   - Emit `answer_candidates.txt` for a human eyeball pass down to ~200 → `answer_set.txt`.
   - (Plan note: leave a clear comment that this is the one manual step; ~200 words = 6+ months of daily content.)
5. **Generate puzzle files:**
   - For each answer word: compute cosine similarity against the entire guess set; scale to a 0–100 score; sort to assign ranks for the **warm band (top ~5,000)**.
   - File contents: `{ scores: { word: score }, ranks: { word: rank }, answerHash, puzzleId }`. **No plaintext answer.**
   - `answerHash` = hash of the answer word (same hash the client will run on guesses).
   - **Each file is identified by a stable `puzzleId`** (not by date). File name = hash of (puzzleId + secret) so it's not guessable. Date routes resolve through the manifest and then reuse the same puzzle files.
6. **Date scheduling:** deterministic — shuffle `answer_set` once with a fixed seed; `word[N] = shuffled[N]` from a launch epoch date. Emit a manifest mapping **date → puzzleId** (the daily schedule is just a layer on top of the ID-keyed files). The manifest must not leak future answers; the client only resolves today and server-approved catch-up dates.
7. Write outputs to a local `dist/puzzles/` dir.

**Done when:** running one command produces `guess_set.txt`, `answer_set.txt`, and ~200 puzzle JSON files locally; spot-checking a file shows sane scores (synonyms score high, unrelated words low) and no plaintext answer.

---

## Phase 2 — R2 storage & data access

**Goal:** Puzzle files live on R2 and the app can fetch "today's" file.

**Tasks**
1. Create an R2 bucket; add the binding to `wrangler.toml` (`[[r2_buckets]]`).
2. Add an upload script (`wrangler r2 object put` loop, or R2 API) to push `dist/puzzles/` → R2. Keep it idempotent.
3. Decide serving path: either expose puzzle files via a Worker route that streams from R2, or via public bucket + custom domain. **Recommend** a thin Worker/route `GET /puzzles/:hashedName` so you control caching headers and can add light obfuscation later.
4. Set long-lived cache headers (files are immutable per day).
5. App-side data layer: a `getTodaysPuzzle()` function that resolves today's hashed filename from the manifest and fetches it (wrap in **TanStack Query** for caching/dedupe).

**Done when:** the deployed (or local `wrangler dev`) app can fetch today's puzzle file from R2 and log its contents; future-date files aren't guessable from the URL.

---

## Phase 3 — Core game engine (client-side logic)

**Goal:** Pure, tested game logic with no UI. This is the heart — keep it isolated and unit-tested.

**Tasks**
1. `src/lib/normalize.ts` — lowercase, trim, strip accents.
2. `src/lib/hash.ts` — the guess/answer hash (must match the Python pipeline's hash exactly; verify round-trip against a known puzzle file).
3. `src/games/word/engine.ts`:
   - `scoreGuess(guess, puzzle)` → `{ status: 'win' | 'scored' | 'unknown', score?, rank? }`.
   - Reject words not in the puzzle's score set (`unknown`).
   - Win when `hash(normalize(guess)) === puzzle.answerHash`.
   - Return rank only when within the warm band.
   - **Must be pure and runnable server-side unchanged** (no `window`/DOM/localStorage references inside the engine). This is the seam that lets multiplayer do authoritative server-side scoring later with the same code.
4. `src/games/word/state.ts` — a reducer managing: guesses list, dedupe (surface existing row, don't duplicate), solved flag, best-guess tracking.
5. **Unit tests** (Bun test) for engine + reducer: win detection, unknown rejection, dedupe, normalization, rank-band behavior.

**Done when:** all engine/reducer unit tests pass; hash matches the Python pipeline on a real puzzle file; no UI yet.

---

## Phase 4 — Game UI (minimal, classic Semantle)

**Goal:** The playable word-game route. Deliberately minimal per MVP scope.

**Tasks**
1. Route `src/routes/games/word.tsx` (or your router's convention).
2. Components:
   - Guess input + submit (Enter key).
   - Guess history list — each row shows word + similarity score (+ rank when warm).
   - Friendly inline messages: "not in word list", "already guessed".
   - **Win screen**: win message + total guess count. (No give-up, no countdown, no share — out of MVP scope.)
3. Wire UI → engine/reducer from Phase 3 → puzzle data from Phase 2.
4. Loading and error states for the puzzle fetch.
5. Mobile-responsive (Tailwind); keep it clean and uncluttered.

**Done when:** you can play a full game in the browser — type guesses, see scores/ranks, get rejected on unknowns, see dedupe, and reach the win screen.

---

## Phase 5 — Persistence (localStorage)

**Goal:** Progress survives refresh and respects daily boundaries.

**Tasks**
1. `src/lib/storage.ts`:
   - Mint an `anon_id` UUID on first visit; persist it. (Unused now; enables future account-linking/stats. Do not send anywhere.)
   - Store guesses **keyed by `puzzleId`** so a new day starts fresh and yesterday's data doesn't bleed in.
   - Store a `solved` flag per `puzzleId`.
2. On load: rehydrate the reducer from storage for today's puzzle; if already solved, show the win screen directly.
3. Guard against storage being unavailable (private mode) — degrade gracefully to in-memory.

**Done when:** refreshing mid-game restores guesses; a solved puzzle reopens to the win screen; a new puzzleId starts clean.

---

## Phase 6 — Platform shell & scalability scaffolding

**Goal:** Make "add the next game" trivial, and give the platform a front door.

**Tasks**
1. Landing route `/` listing available games (just the word game for now) — driven by a `games` registry/config, not hardcoded markup.
2. Confirm the routes-per-game pattern is clean: adding a game = new folder under `src/games/*` + new route + registry entry, with shared engine utilities reused.
3. Extract anything word-game-specific out of shared `lib/` so future games don't inherit word-game assumptions.
4. Basic shared layout/header.

**Done when:** the home page lists the game and links to it; a short written note in `README.md` describes the exact steps to add game #2.

---

## Phase 7 — Deploy & verify on Cloudflare

**Goal:** Live on Cloudflare Workers, end-to-end.

**Tasks**
1. Finalize `wrangler.toml` (Workers + R2 binding, `nodejs_compat`, Start server entry).
2. Confirm the `@cloudflare/vite-plugin` build outputs a Workers-compatible bundle; `bun run build` then `wrangler deploy`.
3. Enable static prerendering for the shell/routes where it helps first paint.
4. GitHub Actions CI: build + deploy on push to main; puzzle-upload step (or run manually — decide and document).
5. Smoke test the deployed URL: fetch today's puzzle, play to a win, verify caching headers, verify future puzzles aren't guessable.

**Done when:** the game is playable on the live Cloudflare URL, puzzle files serve from R2 via CDN, and a push triggers a successful deploy.

---

## Explicitly deferred (post-MVP backlog — do not build now)

Temperature/hot-cold bar · give-up/reveal · next-puzzle countdown · plain-text copy share · expanding the answer set via the same pipeline.

**Daily catch-up/archive:** show the last seven official daily puzzles, including today, by resolving allowed dates through the manifest. Do not expose random puzzle IDs or future dates in the MVP.

**Multiplayer:** the big one — forces in the pieces the MVP omits. Needs (a) a realtime layer — **Cloudflare Durable Objects** are the natural fit, one object per match, WebSocket-native; (b) **Neon + Drizzle** with a multi-game schema that includes **match/session tables** (a match has many players — shape it as matches + match_players, not just per-user results); (c) real accounts, upgrading `anon_id` → linked user on signup; (d) **authoritative server-side scoring** using the *same* pure engine from Phase 3 (the seam left open in guardrails). Do not design netcode before the single-player game is proven fun.
