export type WordPuzzle = {
  version: number
  puzzleId: string
  answerHash: string
  scoreScale: string
  rankBandSize: number
  scores: Record<string, number>
  ranks: Record<string, number>
}

export type WordScoreResult =
  | { status: "win"; word: string; score: 100; rank: 1 }
  | { status: "scored"; word: string; score: number; rank?: number }
  | { status: "unknown"; word: string }

export type WordGuess = {
  id: number
  word: string
  score: number
  rank?: number
  isHint?: boolean
}

export type GameStatus = {
  lead: string
  sub: string
}
