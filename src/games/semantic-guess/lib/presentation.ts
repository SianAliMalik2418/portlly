import type { GameStatus, WordGuess } from "../types"

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
      lead: "🔥 Almost there!",
      sub: `Best: ${bestGuess?.word} · rank #${bestGuess?.rank?.toLocaleString()}`,
    }
  if (bestScore >= 70)
    return { lead: "Very close!", sub: "Think synonyms and close cousins." }
  if (bestScore >= 50)
    return { lead: "Getting closer.", sub: "You are in the right neighbourhood." }
  if (bestScore >= 35)
    return { lead: "On the right track.", sub: "Keep narrowing it down." }
  if (bestScore >= 20)
    return { lead: "In the area.", sub: "Same broad theme, wrong corner." }
  return { lead: "Far away.", sub: "Try a totally different direction." }
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
