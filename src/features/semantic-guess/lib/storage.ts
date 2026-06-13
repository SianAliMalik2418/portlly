import type { WordGuess } from "@/games/word/types"

type PersistedState = {
  guesses: WordGuess[]
  won: boolean
  nextId: number
}

const storageKey = (puzzleId: string) => `closer:${puzzleId}`

export const loadGameState = (puzzleId: string): PersistedState | null => {
  try {
    const raw = localStorage.getItem(storageKey(puzzleId))
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

export const saveGameState = (puzzleId: string, state: PersistedState) => {
  try {
    localStorage.setItem(storageKey(puzzleId), JSON.stringify(state))
  } catch {}
}

export const clearGameState = (puzzleId: string) => {
  try {
    localStorage.removeItem(storageKey(puzzleId))
  } catch {}
}
