# Portlly: Phased Product Requirements

## Summary

Build **Portlly** as a game-first portfolio platform for playful educational web games. The first playable title is **Semantic Guess**, a semantic word puzzle for adult word-game players.

Portlly should start with a very small MVP: a polished hub page that lists games, one playable Semantic Guess page, and a simple input-driven guessing loop. Larger V1 requirements such as real daily puzzles, database-backed rankings, hints, reveal, admin tooling, analytics, accounts, stats, and leaderboards should be added in later phases.

Research basis:

- [Contexto](https://contexto.me/) and [Semantle](https://semantle.com/) validate the "guess by meaning, not spelling" loop.
- [Neal.fun](https://neal.fun/) validates a lightweight platform of playful interactive web experiences.
- [OpenAI embeddings docs](https://developers.openai.com/api/docs/guides/embeddings) recommend embeddings for relatedness/similarity and cosine similarity.
- [Neon pgvector docs](https://neon.com/docs/extensions/pgvector) support storing/searching embeddings in Neon Postgres.

## Key Product Decisions

- Target audience: **adult word-game players**, with learning built into the play loop rather than classroom-style instruction.
- MVP release shape: **hub first**. The root page `/` is the Portlly portfolio/game hub, and clicking the first playable game opens its dedicated game page.
- First public game name: **Semantic Guess**.
- First game route: `/games/semantic-guess`.
- Core feedback: show **rank + warmth color**, not percentage. Lower rank means closer to the answer.
- MVP mode: one **fixed demo puzzle**.
- MVP scoring: **static precomputed puzzle data** stored locally in the codebase. No database and no live OpenAI calls.
- MVP persistence: browser **local storage** preserves guesses across refreshes.
- MVP unknown guesses: reject guesses outside the demo vocabulary with an inline error; do not add them to the guess list.
- MVP end state: solve-only. Show a simple success state when the exact answer is guessed; no reveal button yet.
- MVP visual direction: **custom pixel-cabinet arcade** styling with a bold game-like feel.
- Monetization: **none**.

## Phase 1: MVP Hub + Static Semantic Guess

Goal: prove the core experience with the smallest polished playable product.

- Replace the starter page with a Portlly hub at `/`.
- Show Semantic Guess as the playable game card.
- Include disabled or teaser cards for more games coming soon.
- Add a Semantic Guess page at `/games/semantic-guess`.
- Use one fixed local demo puzzle with precomputed accepted guesses, ranks, and warmth bands.
- Provide an input and submit action for guesses.
- Show guessed items below the input with:
  - guessed word,
  - rank,
  - warmth band/color.
- Normalize simple input casing/spacing.
- Reject duplicate guesses and unknown guesses with lightweight inline feedback.
- Persist guesses in local storage by puzzle id.
- Show a solved state when the player guesses the exact answer.
- Keep MVP out of scope:
  - database,
  - OpenAI calls,
  - daily scheduling,
  - practice mode,
  - hints,
  - reveal,
  - leaderboard,
  - accounts,
  - stats,
  - analytics,
  - admin UI.
- Make the app deployable to Cloudflare from the start.

## Phase 2: Real Puzzle Data + Minimal Admin

Goal: move from a local demo puzzle to real precomputed puzzle infrastructure.

- Add **Neon Postgres** and **Drizzle ORM**.
- Add migration discipline and environment-based database configuration.
- Keep Cloudflare compatibility as a constraint when choosing TanStack Start server/runtime patterns.
- Model the core content structures:
  - games,
  - puzzle instances,
  - word bank,
  - embeddings,
  - precomputed guess rankings,
  - warmth bands,
  - schedule/approval state.
- Use **OpenAI `text-embedding-3-small`** for offline batch generation only.
- Do not call OpenAI during live gameplay scoring.
- Store embeddings/rankings in Neon; use `pgvector` where useful for generation and admin review.
- Add **Better Auth** in this phase to protect internal admin access.
- Build a minimal protected admin page where admins can:
  - review generated puzzles,
  - inspect closest words,
  - approve scheduled dates,
  - disable bad puzzles.
- Gameplay still reads precomputed rankings only.

## Phase 3: Practice Mode

Goal: add replay value before competition or heavier social systems.

- Add multiple playable practice puzzles backed by the real puzzle data model.
- Add navigation for Daily versus Practice once daily puzzle data exists.
- Let admins control which approved puzzles are available for practice.
- Keep accounts, stats, sharing, and leaderboards out of this phase unless needed for technical compatibility.

## Phase 4: Hints, Reveal, And Recaps

Goal: add the signature learning layer around the core guessing loop.

- Add free directional hints.
- Hint types may include:
  - broader/narrower,
  - category shift,
  - related field,
  - abstraction level,
  - conceptual neighborhood.
- Hints should guide thinking rather than reveal the next closest word.
- Track hint usage for transparency.
- Add reveal-after-effort, such as after 20 guesses or meaningful hint use.
- Add post-game recap content:
  - answer,
  - closest guesses,
  - concept cluster,
  - short "why this path made sense" explanation.

## Phase 5: Analytics

Goal: measure the real play loop after core behavior is stable.

- Add **PostHog Cloud** for privacy-friendly product analytics.
- Track:
  - hub views,
  - game starts,
  - guess counts,
  - solve rate,
  - hint usage,
  - reveal usage,
  - abandonment,
  - practice engagement,
  - retention.

## Phase 6: Accounts, Stats, And Competition

Goal: add optional identity and competitive features after the solo game loop works.

- Add optional player accounts.
- Support anonymous player/session identity.
- Add core personal stats:
  - played,
  - solved,
  - current streak,
  - max streak,
  - average guesses,
  - best solve.
- Add daily leaderboard entries.
- Rank solved players primarily by **fewest guesses**.
- Keep hint count visible for transparency, but do not make it a hard leaderboard penalty by default.
- Add solve/reveal outcomes and guess attempts to the persistent data model.
- Keep sharing, custom friend challenges, monetization, and full social graph out of scope until after this phase.

## Semantic Engine Requirements

- Live gameplay must use precomputed rankings.
- OpenAI is used for offline generation/admin workflows only.
- Puzzle data should include:
  - target word,
  - accepted guess vocabulary,
  - ranks,
  - warmth bands,
  - hint metadata,
  - post-game explanation content.
- Word domain should be **general knowledge**:
  - common concepts,
  - nouns,
  - professions,
  - places,
  - science/culture/tech terms.
- Long-term difficulty target is **medium-hard**, aiming for adult solves in roughly 10-40 guesses.

## Test Plan

### Phase 1

- Add **Playwright** for E2E coverage.
- E2E tests should cover:
  - hub renders,
  - playable Semantic Guess card navigates to `/games/semantic-guess`,
  - valid guess appears with rank and warmth,
  - unknown guess shows an error,
  - duplicate guess shows an error,
  - refresh preserves guesses from local storage,
  - answer guess triggers solved state.
- Build and typecheck must pass.

### Later Phases

- Unit tests:
  - rank/warmth band calculation,
  - guess normalization and validation,
  - reveal eligibility,
  - hint availability and logging,
  - streak/stat updates,
  - leaderboard ordering by fewest guesses.
- Integration tests:
  - database-backed daily play,
  - practice puzzle flow,
  - admin approval and scheduled daily puzzle selection,
  - auth-protected admin access,
  - precomputed rankings returning consistent results.
- UI/E2E tests:
  - mobile-first gameplay loop,
  - keyboard submission on desktop,
  - hint flow,
  - reveal flow,
  - solve screen and concise explanation,
  - leaderboard display,
  - empty/error/loading states.
- Content QA:
  - validate generated puzzle queues before publish,
  - spot-check target words for ambiguity,
  - spot-check offensive content,
  - spot-check overly obscure answers,
  - spot-check bad semantic neighbors.

## Assumptions

- Platform name is **Portlly**.
- First public game name is **Semantic Guess**.
- MVP starts with one fixed demo puzzle.
- MVP is hub-first, not game-first.
- MVP uses rank and warmth rather than percentage.
- MVP persists guesses in local storage.
- MVP has no leaderboard, competition, hints, reveal, shading, accounts, stats, analytics, or database.
- Future V1 phases can reintroduce daily puzzles, practice mode, hints, reveal, admin tooling, PostHog, Better Auth, Neon, Drizzle, and leaderboards in the order above.
