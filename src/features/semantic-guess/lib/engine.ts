import type { WordGuess } from "@/games/word/types"
import type { GameStatus } from "../types"

export const getTemperatureLabel = (score: number) => {
  if (score >= 92) return "BOILING"
  if (score >= 70) return "SCORCHING"
  if (score >= 55) return "HOT"
  if (score >= 42) return "WARM"
  if (score >= 30) return "TEPID"
  if (score >= 18) return "COOL"
  if (score >= 10) return "COLD"
  return "FREEZING"
}

export const getStatusMessage = (
  bestScore: number | null,
  bestGuess: WordGuess | null
): GameStatus => {
  if (bestScore === null) {
    return {
      lead: "Make your first guess.",
      sub: "Type any word — closeness is by meaning.",
    }
  }
  if (bestScore >= 92)
    return {
      lead: "🔥 You are boiling hot.",
      sub: `Best: ${bestGuess?.word} · rank #${bestGuess?.rank?.toLocaleString()}`,
    }
  if (bestScore >= 70)
    return { lead: "Scorching!", sub: "Think synonyms and close cousins." }
  if (bestScore >= 50)
    return { lead: "Getting hot.", sub: "You are in the right neighbourhood." }
  if (bestScore >= 35)
    return { lead: "Warm.", sub: "On the right track — narrow it down." }
  if (bestScore >= 20)
    return { lead: "Cool.", sub: "Same broad theme, wrong corner." }
  return { lead: "Cold.", sub: "Try a totally different direction." }
}

const emojiForScore = (score: number) => {
  if (score >= 85) return "🟥"
  if (score >= 60) return "🟧"
  if (score >= 45) return "🟨"
  if (score >= 30) return "🟩"
  if (score >= 15) return "🟦"
  return "⬛"
}

export const buildEmojiJourney = (guesses: WordGuess[]) =>
  guesses
    .slice(-14)
    .map((g) => emojiForScore(g.score))
    .join("") + "🟥"

export const sortGuesses = (guesses: WordGuess[]) =>
  [...guesses].sort((a, b) => b.score - a.score)
