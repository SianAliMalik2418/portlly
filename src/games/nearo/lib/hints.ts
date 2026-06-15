import type { WordGuess, WordPuzzle } from "../types"

const STARTER_MIN_RANK_RATIO = 0.6
const STARTER_MAX_RANK_RATIO = 0.85
const HINT_CLOSEST_RANK = 15
const HINT_MAX_IMPROVEMENT = 0.4

type RankedWord = {
  word: string
  rank: number
}

type ScoredWord = {
  word: string
  score: number
  rank?: number
}

const stableHash = (value: string) =>
  value.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

const compareWords = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

const getRankedWords = (
  puzzle: WordPuzzle,
  guessedWords = new Set<string>()
): RankedWord[] =>
  Object.entries(puzzle.ranks)
    .filter(
      ([word, rank]) =>
        !guessedWords.has(word) &&
        word in puzzle.scores &&
        Number.isFinite(rank) &&
        rank > 1 &&
        rank <= puzzle.rankBandSize
    )
    .map(([word, rank]) => ({ word, rank }))

const getScoredWords = (
  puzzle: WordPuzzle,
  guessedWords = new Set<string>()
): ScoredWord[] =>
  Object.entries(puzzle.scores)
    .filter(
      ([word, score]) =>
        !guessedWords.has(word) &&
        Number.isFinite(score) &&
        score < 100 &&
        puzzle.ranks[word] !== 1
    )
    .map(([word, score]) => {
      const rank = puzzle.ranks[word]
      return {
        word,
        score,
        rank: Number.isFinite(rank) ? rank : undefined,
      }
    })

const pickStableWord = <Word extends { word: string }>(
  words: Word[],
  key: string
) => {
  if (words.length === 0) return null
  return words[stableHash(key) % words.length]?.word ?? null
}

const pickClosestToRank = (
  words: RankedWord[],
  targetRank: number,
  key: string
) => {
  if (words.length === 0) return null

  const sorted = [...words].sort((a, b) => {
    const distance =
      Math.abs(a.rank - targetRank) - Math.abs(b.rank - targetRank)
    if (distance !== 0) return distance
    return a.rank - b.rank
  })
  const bestDistance = Math.abs(sorted[0].rank - targetRank)
  const tied = sorted.filter(
    (candidate) => Math.abs(candidate.rank - targetRank) === bestDistance
  )

  return pickStableWord(tied, key)
}

const pickScoredWord = (
  words: ScoredWord[],
  key: string,
  direction: "asc" | "desc",
  ratio = 0
) => {
  if (words.length === 0) return null

  const sorted = [...words].sort((a, b) => {
    const score = direction === "asc" ? a.score - b.score : b.score - a.score
    if (score !== 0) return score
    return compareWords(a.word, b.word)
  })
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))
  const pickedScore = sorted[index]?.score
  const tied = sorted.filter((candidate) => candidate.score === pickedScore)

  return pickStableWord(tied, key)
}

const fallbackStarterWord = (puzzle: WordPuzzle) => {
  const entries = Object.entries(puzzle.scores)
  const candidates = entries
    .filter(([, score]) => score >= 35 && score <= 50)
    .map(([word]) => word)

  if (candidates.length > 0) {
    return candidates[
      stableHash(`${puzzle.puzzleId}:starter-score`) % candidates.length
    ]
  }

  return entries.length > 0 ? entries[0][0] : null
}

export const pickStarterWord = (puzzle: WordPuzzle): string | null => {
  const minRank = Math.ceil(puzzle.rankBandSize * STARTER_MIN_RANK_RATIO)
  const maxRank = Math.floor(puzzle.rankBandSize * STARTER_MAX_RANK_RATIO)
  const rankedWords = getRankedWords(puzzle)
  const rankedCandidates = rankedWords.filter(
    ({ rank }) => rank >= minRank && rank <= maxRank
  )
  const targetRank = Math.floor((minRank + maxRank) / 2)

  return (
    pickClosestToRank(
      rankedCandidates,
      targetRank,
      `${puzzle.puzzleId}:starter-rank`
    ) ??
    pickClosestToRank(
      rankedWords,
      targetRank,
      `${puzzle.puzzleId}:starter-any-rank`
    ) ??
    fallbackStarterWord(puzzle)
  )
}

const getBestRank = (guesses: WordGuess[]) =>
  guesses.reduce<number | null>((bestRank, guess) => {
    if (typeof guess.rank !== "number") return bestRank
    return bestRank === null ? guess.rank : Math.min(bestRank, guess.rank)
  }, null)

const fallbackHintWord = (puzzle: WordPuzzle, guesses: WordGuess[]) => {
  const guessedWords = new Set(guesses.map((guess) => guess.word))
  const scoredWords = getScoredWords(puzzle, guessedWords)
  const closestHintRank = Math.min(HINT_CLOSEST_RANK, puzzle.rankBandSize)
  const safeScoredWords = scoredWords.filter(
    ({ rank }) => typeof rank !== "number" || rank >= closestHintRank
  )
  const fallbackPool =
    safeScoredWords.length > 0 ? safeScoredWords : scoredWords
  const bestScore =
    guesses.length === 0
      ? 0
      : guesses.reduce((score, guess) => Math.max(score, guess.score), 0)
  const floor = bestScore + 5
  const ceiling = 85

  const improvingScoreWords =
    floor >= ceiling
      ? []
      : fallbackPool.filter(({ score }) => score > floor && score <= ceiling)

  return (
    pickScoredWord(
      improvingScoreWords,
      `${puzzle.puzzleId}:hint-score-range`,
      "asc",
      0.3
    ) ??
    pickScoredWord(
      fallbackPool.filter(({ score }) => score <= ceiling),
      `${puzzle.puzzleId}:hint-score-safe`,
      "desc"
    ) ??
    pickScoredWord(fallbackPool, `${puzzle.puzzleId}:hint-score-any`, "desc")
  )
}

export const pickHintWord = (
  puzzle: WordPuzzle,
  guesses: WordGuess[],
  hintIndex = 0
): string | null => {
  const guessedWords = new Set(guesses.map((guess) => guess.word))
  const rankedWords = getRankedWords(puzzle, guessedWords)
  const closestHintRank = Math.min(HINT_CLOSEST_RANK, puzzle.rankBandSize)
  const bestRank = getBestRank(guesses)

  if (bestRank === null) {
    const minRank = Math.ceil(puzzle.rankBandSize * STARTER_MIN_RANK_RATIO)
    const maxRank = Math.floor(puzzle.rankBandSize * STARTER_MAX_RANK_RATIO)
    const targetRank = Math.floor((minRank + maxRank) / 2)
    const candidates = rankedWords.filter(
      ({ rank }) => rank >= minRank && rank <= maxRank
    )
    const safeCandidates = rankedWords.filter(
      ({ rank }) => rank >= closestHintRank
    )

    return (
      pickClosestToRank(
        candidates,
        targetRank,
        `${puzzle.puzzleId}:hint:${hintIndex}:entry-rank`
      ) ??
      pickClosestToRank(
        safeCandidates,
        targetRank,
        `${puzzle.puzzleId}:hint:${hintIndex}:entry-any-rank`
      ) ??
      fallbackHintWord(puzzle, guesses)
    )
  }

  const targetRank = Math.max(
    closestHintRank,
    Math.floor(bestRank * (1 - HINT_MAX_IMPROVEMENT))
  )
  const safeRankedWords = rankedWords.filter(
    ({ rank }) => rank >= closestHintRank
  )
  const betterCandidates = safeRankedWords.filter(({ rank }) => rank < bestRank)
  const cappedCandidates = betterCandidates.filter(
    ({ rank }) => rank >= targetRank && rank < bestRank
  )
  const weakerSafeCandidates = safeRankedWords.filter(
    ({ rank }) => rank >= bestRank
  )

  return (
    pickClosestToRank(
      cappedCandidates,
      targetRank,
      `${puzzle.puzzleId}:hint:${hintIndex}:rank`
    ) ??
    pickClosestToRank(
      weakerSafeCandidates,
      bestRank,
      `${puzzle.puzzleId}:hint:${hintIndex}:safe-weaker-rank`
    ) ??
    pickClosestToRank(
      betterCandidates,
      targetRank,
      `${puzzle.puzzleId}:hint:${hintIndex}:safe-better-rank`
    ) ??
    fallbackHintWord(puzzle, guesses)
  )
}
