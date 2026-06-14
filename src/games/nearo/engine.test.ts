import { describe, expect, it } from "vitest"
import { scoreGuess } from "./engine"
import type { WordPuzzle } from "./types"

const puzzle: WordPuzzle = {
  version: 1,
  puzzleId: "word-0001",
  answerHash:
    "0f4168490e38b8447e11ba4bd656aa11b925bd22af30bac464bc153fdb608501",
  scoreScale: "max(0, cosine) * 100",
  rankBandSize: 5,
  scores: {
    boat: 91.9,
    cafe: 42,
    leaf: 17.17,
    river: 99.91,
  },
  ranks: {
    boat: 3,
    river: 2,
  },
}

describe("scoreGuess", () => {
  it("detects wins by normalized guess hash", () => {
    expect(scoreGuess(" WÁTER ", puzzle)).toEqual({
      status: "win",
      word: "water",
      score: 100,
      rank: 1,
    })
  })

  it("rejects guesses outside the puzzle score set", () => {
    expect(scoreGuess("missing", puzzle)).toEqual({
      status: "unknown",
      word: "missing",
    })
  })

  it("scores known guesses and includes ranks only when present", () => {
    expect(scoreGuess("river", puzzle)).toEqual({
      status: "scored",
      word: "river",
      score: 99.91,
      rank: 2,
    })

    expect(scoreGuess("leaf", puzzle)).toEqual({
      status: "scored",
      word: "leaf",
      score: 17.17,
    })
  })

  it("normalizes guesses before score lookup", () => {
    expect(scoreGuess(" CAFÉ ", puzzle)).toEqual({
      status: "scored",
      word: "cafe",
      score: 42,
    })
  })
})
