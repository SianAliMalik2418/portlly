import type { GameStatus, GuessEntry } from "../types"

export const normalizeGuess = (raw: string) => raw.trim().toLowerCase()

export const getTemperatureLabel = (score: number) => {
  if (score >= 0.92) return "BOILING"
  if (score >= 0.70) return "SCORCHING"
  if (score >= 0.55) return "HOT"
  if (score >= 0.42) return "WARM"
  if (score >= 0.30) return "TEPID"
  if (score >= 0.18) return "COOL"
  if (score >= 0.10) return "COLD"
  return "FREEZING"
}

export const getStatusMessage = (
  bestScore: number | null,
  bestGuess: GuessEntry | null,
): GameStatus => {
  if (bestScore === null) {
    return { lead: "Make your first guess.", sub: "Type any word — closeness is by meaning." }
  }
  if (bestScore >= 0.92) return { lead: "🔥 You are boiling hot.", sub: `Best: ${bestGuess?.word} · rank #${bestGuess?.rank.toLocaleString()}` }
  if (bestScore >= 0.70) return { lead: "Scorching!", sub: "Think synonyms and close cousins." }
  if (bestScore >= 0.50) return { lead: "Getting hot.", sub: "You are in the right neighbourhood." }
  if (bestScore >= 0.35) return { lead: "Warm.", sub: "On the right track — narrow it down." }
  if (bestScore >= 0.20) return { lead: "Cool.", sub: "Same broad theme, wrong corner." }
  return { lead: "Cold.", sub: "Try a totally different direction." }
}

const emojiForScore = (score: number) => {
  if (score >= 0.85) return "🟥"
  if (score >= 0.60) return "🟧"
  if (score >= 0.45) return "🟨"
  if (score >= 0.30) return "🟩"
  if (score >= 0.15) return "🟦"
  return "⬛"
}

export const buildEmojiJourney = (guesses: GuessEntry[]) =>
  guesses.slice(-14).map((g) => emojiForScore(g.score)).join("") + "🟥"

export const sortGuesses = (guesses: GuessEntry[]) =>
  [...guesses].sort((a, b) => b.score - a.score)
