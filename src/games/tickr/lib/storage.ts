import { tickrConfig } from "../config"
import type { TickrTimerPreset } from "../types"

const STORAGE_PREFIX = tickrConfig.storagePrefix
const SEEN_IDS_LIMIT = 500
const memoryStore = new Map<string, string>()

const bestKey = (presetSeconds: TickrTimerPreset) =>
  `${STORAGE_PREFIX}:best:${presetSeconds}`
const seenIdsKey = () => `${STORAGE_PREFIX}:seen-question-ids`

const getLocalStorage = () => {
  if (typeof window === "undefined") return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

const getStoredValue = (key: string) => {
  const storage = getLocalStorage()

  try {
    return storage?.getItem(key) ?? memoryStore.get(key) ?? null
  } catch {
    return memoryStore.get(key) ?? null
  }
}

const setStoredValue = (key: string, value: string) => {
  const storage = getLocalStorage()
  memoryStore.set(key, value)

  try {
    storage?.setItem(key, value)
  } catch {}
}

const removeStoredValue = (key: string) => {
  const storage = getLocalStorage()
  memoryStore.delete(key)

  try {
    storage?.removeItem(key)
  } catch {}
}

export const loadBestScore = (presetSeconds: TickrTimerPreset) => {
  const raw = getStoredValue(bestKey(presetSeconds))
  if (!raw) return null

  const score = Number(raw)

  return Number.isInteger(score) && score >= 0 ? score : null
}

export const saveBestScore = (
  presetSeconds: TickrTimerPreset,
  score: number
) => {
  setStoredValue(bestKey(presetSeconds), String(Math.max(0, Math.floor(score))))
}

export const loadBestScores = (): Record<number, number | null> =>
  Object.fromEntries(
    tickrConfig.timerPresets.map((presetSeconds) => [
      presetSeconds,
      loadBestScore(presetSeconds),
    ])
  )

export const loadSeenQuestionIds = () => {
  const raw = getStoredValue(seenIdsKey())
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((value): value is string => typeof value === "string")
      .slice(-SEEN_IDS_LIMIT)
  } catch {
    return []
  }
}

export const saveSeenQuestionIds = (seenIds: string[]) => {
  const uniqueIds = Array.from(new Set(seenIds)).slice(-SEEN_IDS_LIMIT)
  setStoredValue(seenIdsKey(), JSON.stringify(uniqueIds))
}

export const clearTickrStorage = () => {
  for (const presetSeconds of tickrConfig.timerPresets) {
    removeStoredValue(bestKey(presetSeconds))
  }
  removeStoredValue(seenIdsKey())
}
