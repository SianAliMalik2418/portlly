import { hashGuess } from "@/lib/hash"
import { normalizeGuess } from "@/lib/normalize"
import type { WordPuzzle, WordScoreResult } from "./types"

export const scoreGuess = (
  rawGuess: string,
  puzzle: WordPuzzle
): WordScoreResult => {
  const word = normalizeGuess(rawGuess)

  if (hashGuess(word) === puzzle.answerHash) {
    return { status: "win", word, score: 100, rank: 1 }
  }

  const score = puzzle.scores[word]

  if (typeof score !== "number") {
    return { status: "unknown", word }
  }

  const rank = puzzle.ranks[word]

  if (typeof rank === "number") {
    return { status: "scored", word, score, rank }
  }

  return { status: "scored", word, score }
}
