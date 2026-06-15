# Build Plan — Tickr Survival Trivia Game

**For:** AI coding agent
**Platform:** Portlyy (existing TanStack Start + Bun + Cloudflare Workers/R2 codebase)
**Conforms to:** the Portlyy game-module convention (`src/games/tickr/`), static-bank-on-R2 pattern, no DB, no auth, localStorage persistence. Mirrors how Nearo is built.

> **Game ID:** `tickr`

---

## 1. Concept

A rapid-fire survival trivia game. A timer is always ticking. The player answers multiple-choice questions as fast as they can — correct answers add time, wrong answers subtract time. When the clock hits zero, the run ends. An **optional, opt-in jumpscare mode** plays a mild scare at the moment of death; off by default, gated behind a consent modal.

---

## 2. User Story (the spec, in plain narrative)

> As a player, I land on the game's **start screen**. I see three **timer presets** (e.g. 30s / 60s / 90s) — picking a shorter timer is a harder challenge. Next to them is a **Jumpscare Mode toggle**, off by default, with a visible warning line. If I switch it on, a **confirmation modal** appears warning me about sudden scares, loud sounds, and flashing, and I have to actively click "I understand, enable" — or cancel. My choice is remembered for next time.
>
> I pick a timer and hit **Start**. We show a ready btn in the page and clicking it we show a countdown of 3 secs then The clock immediately begins counting down from my chosen time, and it **never stops** — just stops for brief 3 seconds after the answer then starts ticking. The first question appears instantly with **four answer options**. The moment I click an option, it's scored: **correct adds time** to the clock (capped at my starting amount — I can't bank above it), **wrong subtracts time**. There's no pause — the next question appears the instant I answer, so it's pure rapid fire.
>
> Questions **start easy and get harder** the longer I survive (by how many I've answered), so early on I'm banking time, but later the hard questions trip me up right when wrong answers hurt most. I watch my **correct count** climb and my clock fight to stay above zero.
>
> Eventually the clock hits **zero** and the run ends. If jumpscare mode is **on**, a brief mild scare plays first. Then I see my **result**: how many I got **right** (the headline), plus **time survived**. If I beat my **personal best for that timer preset**, I get a "New best!" celebration. A big **Play Again** lets me go straight back.

---

## 3. Settled Design Decisions (authoritative)

**Core loop**

- Failure condition: **timer-only death.** The clock is the only thing that ends a run.
- Timer **always runs**, including while a question is displayed (rapid-fire). No between-question pause; next question appears instantly on answer ((make the code configurable I might add a brief 0 - 3 secs pause for the timer after the answer so user can read the question))
- **4-option multiple choice**, scored instantly on click.

**Timer economy**

- Three **timer presets** chosen on the start screen (e.g. 30/60/90s — tune exact values). The chosen value is both the **start** and the **ceiling** (correct answers can't push above it). **Floor = 0** ends the run.
- **Correct answer → add time. Wrong answer → subtract time.** (Tune the add/subtract amounts; the add-vs-subtract ratio plus the ceiling is the difficulty engine.)
- Difficulty escalates via **harder questions over the run + the wrong-answer penalty**, not via decaying boosts.

**Difficulty escalation**

- **By question-count thresholds**, fixed curve, same every run (e.g. Q1–5 easy, Q6–15 medium, Q16+ hard — tune thresholds). Deterministic, so runs are comparable.

**Question delivery**

- **Static bank on R2**, harvested **once offline** from OpenTDB. **No live API calls during play, ever.**
- Client **pre-loads** the easy bucket on the start screen, plays from memory, and **background-pre-fetches** medium/hard before the player reaches them, so the timer never waits on the network.
- **Seen-question IDs tracked in localStorage** to avoid near-term repeats across runs; reshuffle when needed.

**Scoring / results**

- **Correct count = headline score.** Time survived = secondary stats.
- **Personal best stored in localStorage, keyed per timer preset.** "New best!" moment on beating it. No server leaderboard (no DB).

**Jumpscare mode**

- **Off by default.** Toggle on the start screen.
- Enabling fires a **consent modal** (photosensitivity/flash, loud-sound, startle warnings) requiring an explicit confirm. Disabling is frictionless. Choice **persisted** in localStorage; standing warning line always visible by the toggle.
- Intensity: **mild only.** A sudden scare image/short clip + sound sting + at most a single flash/shake. **No true strobe / rapid flashing** (seizure risk). **No gore.**
- Scare fires **only at the moment the timer hits zero**, and only if mode is on.
- **Assets are owner-supplied (added later).** Tell owner to provide assets in the codebase

---

## 4. Architecture (conform to Portlyy convention)

Game module at `src/games/tickr/`:

```
src/games/tickr/
├── tickr.tsx               # Entry component — start screen ↔ run ↔ result orchestration
├── config.ts               # id, name, route, timer presets, add/subtract amounts,
│                           #   difficulty thresholds, storage prefix
├── types.ts                # Question, RunState, Result, JumpscareAsset, TimerPreset
├── engine.ts               # PURE: scoreAnswer(), applyTimeDelta(), difficultyForIndex()
│                           #   — no browser APIs, no timers, no DOM
├── state.ts                # reducer: startRun, answer, tick, endRun, reset
├── components/
│   ├── start-screen.tsx        # timer presets + jumpscare toggle + start
│   ├── jumpscare-consent.tsx   # the warning/consent modal
│   ├── question-card.tsx       # question text + 4 option buttons
│   ├── timer-bar.tsx           # always-running clock display
│   ├── run-hud.tsx             # live correct count / streak
│   ├── result-screen.tsx       # correct count headline + stats + best + play again
│   └── jumpscare-overlay.tsx   # plays the scare asset
├── hooks/
│   ├── use-run.ts          # owns the ticking timer loop, wires engine+state, persistence
│   └── use-jumpscare.ts    # consent state, asset loading, trigger
├── lib/
│   ├── storage.ts          # localStorage: best-per-preset, jumpscare pref, seen-IDs
│   ├── bank.ts             # in-memory bank: load buckets, pre-fetch, pick next unseen
│   └── jumpscare-assets.ts # asset manifest + interface + safe placeholder
├── data/
│   └── questions.ts        # fetch difficulty buckets from R2 (TanStack Query)
├── seo.ts                  # VideoGame/HowTo/FAQ structured data
└── *.test.ts               # engine, state, lib unit tests
```

**Purity rule (from the README):** `engine.ts` and `state.ts` contain no browser APIs or timers — the actual ticking lives in `use-run.ts`, which dispatches `tick` actions into the pure reducer. This keeps the loop testable.

---

## 5. Phases

### Phase 0 — Module scaffold & registration

- Scaffold `src/games/tickr/` per convention; add route `src/routes/games/tickr.tsx`; register in `src/features/home/lib/games.ts` (id, name, category: Trivia, glyph, status, description, meta); add `config.ts` with timer presets, time deltas, difficulty thresholds, storage prefix `portlly:tickr`.
- **Done when:** the game appears in the catalog and its route renders a placeholder start screen.

### Phase 1 — Offline question harvest (Python pipeline)

- New script under `scripts/preprocess/` (sibling to the Nearo pipeline), wired to a `bun run preprocess:tickr` command.
- Harvest from **OpenTDB General Knowledge only**: paginate respecting the **~5s rate limit**, use a **session token** to avoid duplicates, loop until exhausted.
- Transform: **multiple-choice only** (drop true/false), **decode HTML entities**, **filter out over-long questions** (reading-time cap for the ticking clock), **dedupe**, keep `category` + `difficulty`.
- Output **difficulty-bucketed files**: `tickr/easy.json`, `medium.json`, `hard.json`. Schema per item: `{ id, question, correct, options[4], category, difficulty }`. (Pre-shuffle options or shuffle client-side — pick one and be consistent.)
- Provide a **smoke fixture** set (tiny, deterministic, no network) for tests, mirroring Nearo's `preprocess:smoke`.
- **Done when:** running the harvest produces the three bucket files locally; smoke fixtures exist; a spot-check shows clean 4-option questions, no entities, no overly long items.

### Phase 2 — R2 storage & data access

- Upload buckets to R2 via the existing `r2:upload` flow (idempotent). Long-lived cache headers (buckets are immutable until you re-harvest).
- `data/questions.ts`: fetch a bucket from R2 via TanStack Query. `lib/bank.ts`: hold loaded questions in memory, expose `loadBucket()`, `prefetchBucket()`, and `nextQuestion(difficulty, seenIds)`.
- **Done when:** the app fetches the easy bucket and can hand out questions from memory; medium/hard pre-fetch on demand.

### Phase 3 — Core engine & state (pure, tested)

- `engine.ts`: `scoreAnswer(question, choice)` → correct/wrong; `applyTimeDelta(clock, delta, ceiling)` (clamp to [0, preset ceiling]); `difficultyForIndex(questionNumber, thresholds)`.
- `state.ts`: reducer for `startRun(preset)`, `answer(choice)`, `tick(dt)`, `endRun`, `reset`. Tracks clock, correct count, current streak/best streak, question index, seen IDs.
- **Unit tests:** correct/wrong scoring, time add/subtract, ceiling clamp, floor→end, difficulty thresholds, streak tracking.
- **Done when:** all engine/state tests pass; no UI; no timers inside the reducer.

### Phase 4 — Run loop & gameplay UI

- `use-run.ts`: drives the always-running timer (requestAnimationFrame or interval) dispatching `tick`; advances to next question instantly on answer; ends run at zero.
- Build `question-card` (4 buttons, instant scoring), `timer-bar` (always running, visual urgency as it nears zero), `run-hud` (live correct count/streak).
- **Done when:** a full run is playable — pick preset, clock ticks during questions, correct/wrong adjust time, difficulty escalates by count, run ends at zero.

### Phase 5 — Start screen, presets & persistence

- `start-screen`: three timer presets + Start. `lib/storage.ts`: **best score per preset**, seen-IDs, plus the jumpscare pref (Phase 6).
- `result-screen`: correct-count headline + time survived + best streak + **per-preset personal best** with "New best!" + Play Again.
- Rehydrate best/seen on load.
- **Done when:** presets work as separate challenges each with their own stored best; results and best-score celebration display correctly; Play Again loops cleanly.

### Phase 6 — SEO, tests, polish, deploy

- `seo.ts`: VideoGame + HowTo + FAQ structured data; add route to sitemap.
- **E2E (Playwright)** `tests/e2e/tickr.spec.ts` using smoke fixtures: pick preset → answer correct (time up) → answer wrong (time down) → reach zero → result + best; jumpscare toggle shows consent modal; mode-off path skips the scare.
- Framer Motion polish on timer urgency, answer feedback, result reveal.
- `bun run check`, `bun run typecheck`, build, deploy via existing Cloudflare flow.
- **Done when:** unit + E2E green, game live on Portlyy, questions served from R2.
-

### Later phase after normal game mode launch — Jumpscare mode (opt-in, safety-gated)

- Add the **toggle** to the start screen with a **standing visible warning line**; default off.
- `jumpscare-consent.tsx`: modal with photosensitivity/flash + loud-sound + startle warnings; explicit "I understand, enable" vs cancel. Fires only when enabling. **Persist** the pref; show full modal on first enable per device.
- `lib/jumpscare-assets.ts`: **asset manifest + interface + safe placeholder** (e.g. a tame "BOO" card + neutral sound) so the system is fully testable without real assets. Document the asset contract: **licensed/owned + flash-safe, no strobe, no gore**, supplied later by the owner.
- `use-jumpscare.ts` + `jumpscare-overlay.tsx`: trigger the scare **only at clock-zero when mode is on**, then proceed to the result screen.
- **Done when:** toggling on requires consent; pref persists; with mode on, the placeholder scare fires at death then shows results; with mode off, the run ends straight to results. No strobe in the placeholder.

---

## 6. Tuning Constants (decide during build, centralize in `config.ts`)

- Timer presets (start = ceiling): e.g. `[30, 60, 90]`.
- Time interval bw questions
- Time added per correct / subtracted per wrong (and whether these scale with difficulty).
- Difficulty thresholds (question counts for easy→medium→hard).
- Over-long-question character cap (harvest filter).
- Batch/pre-fetch sizing.

## 7. Explicitly Out of Scope (do not build)

- No database, no auth, no server-side scoring, no online leaderboard.
- No live LLM/API question generation at runtime.
- No agent-sourced scare assets — owner supplies; build the slot only.
- Adaptive difficulty, multiplayer, category-select modes — possible later, not now.

## 8. Asset Contract (for the owner, referenced by Phase 6)

Scare assets dropped in later must be: **owned or royalty-free/CC0** (no ripped copyrighted YouTube/movie/game/cartoon clips), **mild**, and **flash-safe** (no rapid strobe), with a synchronized **sound sting**.
