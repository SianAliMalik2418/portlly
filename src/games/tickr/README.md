# Tickr

A rapid-fire survival trivia game. The clock is always running: correct answers
add time, wrong answers subtract time, and the run ends when the timer reaches
zero.

## Current Status

- **Phase 0:** module scaffold, route, catalog registration, config, and
  placeholder start screen are in place.
- **Phase 1:** offline Tickr question preprocessing is available through the
  OpenTDB harvester and deterministic smoke fixtures.

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

## Jumpscare Mode

Jumpscare mode is explicitly out of the normal launch path. When added later, it
must remain off by default, require consent before enabling, avoid strobe/gore,
and use only owner-supplied or properly licensed assets.
