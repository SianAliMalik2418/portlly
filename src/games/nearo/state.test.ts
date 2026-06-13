import { describe, expect, it } from "vitest"
import { createWordGameState, wordGameReducer } from "./state"
import type { WordPuzzle } from "./types"

const puzzle: WordPuzzle = {
  version: 1,
  puzzleId: "word-0001",
  answerHash:
    "0f4168490e38b8447e11ba4bd656aa11b925bd22af30bac464bc153fdb608501",
  scoreScale: "max(0, cosine) * 100",
  warmBandSize: 5,
  scores: {
    boat: 91.9,
    leaf: 17.17,
    river: 99.91,
  },
  ranks: {
    boat: 3,
    river: 2,
  },
}

const submit = (state = createWordGameState(), guess: string) =>
  wordGameReducer(state, { type: "submitGuess", guess, puzzle })

describe("wordGameReducer", () => {
  it("adds scored guesses and tracks the best guess", () => {
    const first = submit(undefined, "leaf")
    const second = submit(first, "boat")

    expect(second.guesses).toHaveLength(2)
    expect(second.bestGuess?.word).toBe("boat")
    expect(second.highlightedGuessId).toBe(2)
    expect(second.lastSubmission).toMatchObject({
      status: "scored",
      guess: { word: "boat", score: 91.9, rank: 3 },
    })
  })

  it("rejects unknown guesses without changing the guess list", () => {
    const state = submit(undefined, "unknown")

    expect(state.guesses).toHaveLength(0)
    expect(state.lastSubmission).toEqual({
      status: "unknown",
      word: "unknown",
    })
  })

  it("dedupes normalized guesses and surfaces the existing row", () => {
    const first = submit(undefined, " river ")
    const duplicate = submit(first, "RIVER")

    expect(duplicate.guesses).toHaveLength(1)
    expect(duplicate.highlightedGuessId).toBe(1)
    expect(duplicate.lastSubmission).toMatchObject({
      status: "duplicate",
      guess: { id: 1, word: "river" },
    })
  })

  it("marks the game solved when the answer hash matches", () => {
    const state = submit(undefined, "water")

    expect(state.solved).toBe(true)
    expect(state.bestGuess).toMatchObject({ word: "water", score: 100 })
    expect(state.lastSubmission).toMatchObject({
      status: "win",
      guess: { word: "water", score: 100, rank: 1 },
    })
  })

  it("hydrates persisted guesses and recomputes derived fields", () => {
    const state = wordGameReducer(createWordGameState(), {
      type: "hydrate",
      solved: true,
      guesses: [
        { id: 4, word: "leaf", score: 17.17 },
        { id: 9, word: "river", score: 99.91, rank: 2 },
      ],
    })

    expect(state.solved).toBe(true)
    expect(state.bestGuess?.word).toBe("river")
    expect(state.nextGuessId).toBe(10)
  })
})
