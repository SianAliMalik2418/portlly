import { describe, expect, it } from "vitest"
import { pickHintWord, pickStarterWord } from "./hints"
import type { WordGuess, WordPuzzle } from "../types"

const makePuzzle = (
  ranks: Record<string, number>,
  scores: Record<string, number> = {}
): WordPuzzle => ({
  version: 1,
  puzzleId: "word-0001",
  answerHash: "hash",
  scoreScale: "max(0, cosine) * 100",
  rankBandSize: 5000,
  scores: Object.fromEntries(
    [...new Set([...Object.keys(ranks), ...Object.keys(scores)])].map(
      (word) => [word, scores[word] ?? 50]
    )
  ),
  ranks,
})

describe("rank-based Nearo hints", () => {
  it("picks starter words from the weak ranked band", () => {
    const puzzle = makePuzzle({
      tooClose: 100,
      starter: 3500,
      tooFar: 4600,
    })

    expect(pickStarterWord(puzzle)).toBe("starter")
  })

  it("caps hint improvement to about forty percent toward rank one", () => {
    const puzzle = makePuzzle({
      tooClose: 40,
      target: 600,
      weakImprovement: 900,
      current: 1000,
    })
    const guesses: WordGuess[] = [
      { id: 1, word: "current", score: 80, rank: 1000 },
    ]

    expect(pickHintWord(puzzle, guesses)).toBe("target")
  })

  it("uses a score fallback instead of a word inside the close-rank cap", () => {
    const puzzle = makePuzzle(
      {
        tooClose: 24,
        current: 30,
      },
      {
        current: 90,
        fallback: 65,
        tooClose: 95,
      }
    )
    const guesses: WordGuess[] = [
      { id: 1, word: "current", score: 90, rank: 30 },
    ]

    expect(pickHintWord(puzzle, guesses)).toBe("fallback")
  })

  it("allows hints down to rank twenty five", () => {
    const puzzle = makePuzzle({
      tooClose: 24,
      cap: 25,
      current: 30,
    })
    const guesses: WordGuess[] = [
      { id: 1, word: "current", score: 90, rank: 30 },
    ]

    expect(pickHintWord(puzzle, guesses)).toBe("cap")
  })

  it("uses a weak ranked word when the player has no ranked guesses", () => {
    const puzzle = makePuzzle({
      tooClose: 100,
      starterHint: 3500,
      tooFar: 4700,
    })
    const guesses: WordGuess[] = [{ id: 1, word: "unranked", score: 20 }]

    expect(pickHintWord(puzzle, guesses)).toBe("starterHint")
  })

  it("uses a safe ranked fallback when the preferred rank window is empty", () => {
    const puzzle = makePuzzle({
      tooStrong: 40,
      safeFallback: 140,
      current: 100,
    })
    const guesses: WordGuess[] = [
      { id: 1, word: "current", score: 90, rank: 100 },
    ]

    expect(pickHintWord(puzzle, guesses)).toBe("safeFallback")
  })

  it("falls back to score when no ranked words are usable", () => {
    const puzzle = makePuzzle(
      {},
      {
        current: 20,
        fallback: 60,
      }
    )
    const guesses: WordGuess[] = [{ id: 1, word: "current", score: 20 }]

    expect(pickHintWord(puzzle, guesses)).toBe("fallback")
  })

  it("still returns a score fallback when the current best score is high", () => {
    const puzzle = makePuzzle(
      {},
      {
        current: 92,
        weakFallback: 55,
        fallback: 75,
      }
    )
    const guesses: WordGuess[] = [{ id: 1, word: "current", score: 92 }]

    expect(pickHintWord(puzzle, guesses)).toBe("fallback")
  })
})
