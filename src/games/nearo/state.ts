import { scoreGuess } from "./engine"
import type { WordGuess, WordPuzzle } from "./types"

export type WordSubmission =
  | { status: "idle" }
  | { status: "unknown"; word: string }
  | { status: "duplicate"; guess: WordGuess }
  | { status: "scored"; guess: WordGuess }
  | { status: "win"; guess: WordGuess }

export type WordGameState = {
  guesses: Array<WordGuess>
  solved: boolean
  bestGuess: WordGuess | null
  highlightedGuessId: number | null
  nextGuessId: number
  lastSubmission: WordSubmission
}

export type WordGameAction =
  | { type: "submitGuess"; guess: string; puzzle: WordPuzzle }
  | { type: "hydrate"; guesses: Array<WordGuess>; solved?: boolean }
  | { type: "reset" }

const findBestGuess = (guesses: Array<WordGuess>) =>
  guesses.reduce<WordGuess | null>(
    (bestGuess, guess) =>
      !bestGuess || guess.score > bestGuess.score ? guess : bestGuess,
    null
  )

const getNextGuessId = (guesses: Array<WordGuess>) =>
  guesses.reduce((nextId, guess) => Math.max(nextId, guess.id + 1), 1)

export const createWordGameState = (
  partial?: Partial<Pick<WordGameState, "guesses" | "solved">>
): WordGameState => {
  const guesses = partial?.guesses ?? []

  return {
    guesses,
    solved: partial?.solved ?? false,
    bestGuess: findBestGuess(guesses),
    highlightedGuessId: null,
    nextGuessId: getNextGuessId(guesses),
    lastSubmission: { status: "idle" },
  }
}

export const wordGameReducer = (
  state: WordGameState,
  action: WordGameAction
): WordGameState => {
  if (action.type === "reset") {
    return createWordGameState()
  }

  if (action.type === "hydrate") {
    return createWordGameState({
      guesses: action.guesses,
      solved: action.solved ?? false,
    })
  }

  if (state.solved) {
    return state
  }

  const result = scoreGuess(action.guess, action.puzzle)

  if (result.status === "unknown") {
    return {
      ...state,
      highlightedGuessId: null,
      lastSubmission: { status: "unknown", word: result.word },
    }
  }

  const duplicate = state.guesses.find((guess) => guess.word === result.word)

  if (duplicate) {
    return {
      ...state,
      highlightedGuessId: duplicate.id,
      lastSubmission: { status: "duplicate", guess: duplicate },
    }
  }

  const guess: WordGuess = {
    id: state.nextGuessId,
    word: result.word,
    score: result.score,
    rank: result.rank,
  }
  const guesses = [...state.guesses, guess]
  const solved = result.status === "win"

  return {
    guesses,
    solved,
    bestGuess: findBestGuess(guesses),
    highlightedGuessId: guess.id,
    nextGuessId: state.nextGuessId + 1,
    lastSubmission: { status: solved ? "win" : "scored", guess },
  }
}
