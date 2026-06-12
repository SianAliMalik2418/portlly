export type GuessEntry = {
  id: number
  word: string
  score: number
  rank: number
}

export type ScoreResult =
  | { status: "win" }
  | { status: "scored"; score: number; rank: number }
  | { status: "unknown" }
  | { status: "invalid" }

export type GameStatus = {
  lead: string
  sub: string
}
