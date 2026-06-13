import type { WordGuess } from "../types"

type PersistedState = {
  guesses: WordGuess[]
  won: boolean
}

const STORAGE_PREFIX = "portlly:semantic-guess"
const ANON_ID_KEY = "portlly:anon_id"
const memoryStore = new Map<string, string>()

const storageKey = (puzzleId: string) => `${STORAGE_PREFIX}:${puzzleId}`

const getStoredValue = (key: string) => {
  try {
    return localStorage.getItem(key) ?? memoryStore.get(key) ?? null
  } catch {
    return memoryStore.get(key) ?? null
  }
}

const setStoredValue = (key: string, value: string) => {
  memoryStore.set(key, value)

  try {
    localStorage.setItem(key, value)
  } catch {}
}

const removeStoredValue = (key: string) => {
  memoryStore.delete(key)

  try {
    localStorage.removeItem(key)
  } catch {}
}

const isPersistedGuess = (value: unknown): value is WordGuess => {
  if (!value || typeof value !== "object") return false

  const guess = value as Partial<WordGuess>

  return (
    typeof guess.id === "number" &&
    typeof guess.word === "string" &&
    typeof guess.score === "number" &&
    (guess.rank === undefined || typeof guess.rank === "number")
  )
}

const isPersistedState = (value: unknown): value is PersistedState => {
  if (!value || typeof value !== "object") return false

  const state = value as Partial<PersistedState>

  return (
    Array.isArray(state.guesses) &&
    state.guesses.every(isPersistedGuess) &&
    typeof state.won === "boolean"
  )
}

const createAnonId = () => {
  try {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {}

  return `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

export const getOrCreateAnonId = () => {
  const existing = getStoredValue(ANON_ID_KEY)
  if (existing) return existing

  const anonId = createAnonId()
  setStoredValue(ANON_ID_KEY, anonId)

  return anonId
}

export const loadGameState = (puzzleId: string): PersistedState | null => {
  const raw = getStoredValue(storageKey(puzzleId))
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)

    return isPersistedState(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const saveGameState = (puzzleId: string, state: PersistedState) => {
  setStoredValue(storageKey(puzzleId), JSON.stringify(state))
}

export const clearGameState = (puzzleId: string) => {
  removeStoredValue(storageKey(puzzleId))
}
