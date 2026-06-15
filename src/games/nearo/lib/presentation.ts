import type { GameStatus, WordGuess } from "../types"

export const getStatusMessage = (bestScore: number | null): GameStatus => {
  if (bestScore === null) {
    return {
      lead: "Make your first guess.",
      sub: "Start broad: try a common object, place, or action.",
    }
  }
  if (bestScore >= 100)
    return {
      lead: "You found it!",
      sub: "That was the hidden word.",
    }
  if (bestScore >= 92)
    return {
      lead: "Almost there — try close synonyms.",
      sub: "Use your best guess as a clue and try close synonyms.",
    }
  if (bestScore >= 70)
    return {
      lead: "Very close — get more specific.",
      sub: "Stay in this meaning family and get more specific.",
    }
  if (bestScore >= 50)
    return {
      lead: "Getting nearer — explore related words.",
      sub: "You found the right neighborhood. Try related nouns and verbs.",
    }
  if (bestScore >= 35)
    return {
      lead: "On the right track — shift slightly.",
      sub: "Keep the theme, but shift to a closer everyday word.",
    }
  if (bestScore >= 20)
    return {
      lead: "A faint connection — try another angle.",
      sub: "There is a loose theme here, but the target is elsewhere.",
    }
  return {
    lead: "Far from the target — try another category.",
    sub: "Reset your approach: try a different category or setting.",
  }
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
