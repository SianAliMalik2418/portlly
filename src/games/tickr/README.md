# Tickr

A rapid-fire survival trivia game. The clock is always running: correct answers
add time, wrong answers subtract time, and the run ends when the timer reaches
zero.

## Current Status

- **Phase 0:** module scaffold, route, catalog registration, config, and
  placeholder start screen are in place.
- **Phase 1:** offline Tickr question preprocessing is available through the
  OpenTDB harvester and deterministic smoke fixtures.
- **Phase 2:** R2 upload, bucket serving, TanStack Query fetching, and in-memory
  question bank utilities are in place.
- **Phase 3:** pure scoring, timer math, difficulty mapping, and run reducer are
  implemented with unit tests.
- **Phase 4:** requestAnimationFrame run loop, question advancement, timer bar,
  live HUD, question card, and basic result screen are playable.
- **Phase 5:** start screen presets, per-preset local best scores,
  seen-question persistence, result screen, and play-again flow are wired.

## Game Loop

Players choose a timer preset, answer four-option multiple-choice trivia as fast
as possible, and try to survive by keeping the timer above zero. The headline
score is the number of correct answers. Personal bests are stored locally per
timer preset.

## Configuration

```typescript
// config.ts
{
  id: "tickr",
  name: "Tickr",
  route: "/games/tickr",
  category: "trivia",
  storagePrefix: "portlly:tickr",
  timerPresets: [30, 60, 90],
  correctTimeBonus: 5,
  wrongTimePenalty: 8,
  difficultyThresholds: {
    medium: 6,
    hard: 16,
  },
  answerReviewDelayMs: 0,
}
```

## Architecture Target

```
tickr/
├── tickr.tsx              # Entry component — start/run/result orchestration
├── config.ts              # Metadata and tuning constants
├── types.ts               # Question, run state, results, timer preset types
├── engine.ts              # Pure scoring and timer math
├── state.ts               # Pure reducer / state machine
├── components/            # Start, question, timer, HUD, result UI
├── hooks/                 # Timer loop and browser persistence effects
├── lib/                   # Storage, question bank, optional scare assets
├── data/                  # Question bucket fetching
└── seo.ts                 # Structured data
```

Keep `engine.ts` and `state.ts` free of browser APIs and timers. The ticking
loop belongs in `hooks/use-run.ts`.

## Question Preprocessing

Tickr uses static General Knowledge question buckets generated offline from
OpenTDB category `9`. The runtime game must never call OpenTDB directly.

Run:

```bash
bun run preprocess:tickr:smoke
bun run preprocess:tickr
bun run r2:upload:tickr:local
bun run r2:upload:tickr
```

For local smoke data, use the same env-driven pattern as Nearo:

```bash
PORTLLY_TICKR_DIST=dist/tickr-smoke bun run r2:upload:tickr:local
```

Outputs:

- `dist/tickr-smoke/easy.json`
- `dist/tickr-smoke/medium.json`
- `dist/tickr-smoke/hard.json`
- `dist/tickr/easy.json`
- `dist/tickr/medium.json`
- `dist/tickr/hard.json`

Each question has:

```typescript
{
  id: string
  question: string
  correct: string
  options: [string, string, string, string]
  category: string
  difficulty: "easy" | "medium" | "hard"
}
```

The preprocessor decodes HTML entities, keeps only multiple-choice questions,
keeps only General Knowledge questions, filters over-long questions/answers,
dedupes by question text, and writes one bucket per difficulty.

## Data Access

- R2 keys: `tickr/easy.json`, `tickr/medium.json`, `tickr/hard.json`,
  `tickr/manifest.json`
- API route: `GET /api/tickr/questions?difficulty=easy|medium|hard`
- Client fetcher: `data/questions.ts`
- In-memory runtime bank: `lib/bank.ts`

The start screen preloads the easy bucket and prefetches medium/hard so gameplay
can advance without waiting on network requests.

## Engine And State

`engine.ts` exports pure helpers:

- `scoreAnswer(question, choice)` — exact multiple-choice scoring.
- `applyTimeDelta(clock, delta, ceiling)` — timer math clamped to `[0, preset]`.
- `difficultyForIndex(questionNumber, thresholds)` — deterministic
  easy/medium/hard thresholds.

`state.ts` exports the pure run reducer:

- `startRun` — initializes clock from the selected preset.
- `answer` — scores the choice, applies time bonus/penalty, tracks seen IDs,
  correct/wrong counts, question index, current streak, and best streak.
- `tick` — subtracts elapsed seconds from the clock and ends the run at zero.
- `endRun` / `reset` — explicit terminal and reset transitions.

The reducer contains no timers, browser APIs, persistence, or DOM access.

## Run Loop UI

`hooks/use-run.ts` owns browser-only runtime behavior:

- starts runs from a selected timer preset
- drives the clock with `requestAnimationFrame`
- loads the current difficulty bucket from the in-memory question bank
- advances immediately after an answer
- ends the run when the reducer reports timer death

Phase 4 UI components:

- `components/timer-bar.tsx`
- `components/run-hud.tsx`
- `components/question-card.tsx`

## Persistence And Results

`lib/storage.ts` owns browser persistence with an in-memory fallback for tests
and unavailable localStorage:

- best score per timer preset at `portlly:tickr:best:<seconds>`
- seen question IDs at `portlly:tickr:seen-question-ids`

`components/start-screen.tsx` shows timer presets and the stored best for the
selected preset. `components/result-screen.tsx` shows correct count, survived
time, best streak, stored best, and "New best" when the run beats the previous
score. Play Again restarts with the same preset; Change Clock returns to the
start screen.

## Jumpscare Mode

Jumpscare mode is explicitly out of the normal launch path. When added later, it
must remain off by default, require consent before enabling, avoid strobe/gore,
and use only owner-supplied or properly licensed assets.
