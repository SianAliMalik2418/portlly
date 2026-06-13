import { afterEach, describe, expect, it, vi } from "vitest"
import {
  clearGameState,
  getOrCreateAnonId,
  loadGameState,
  saveGameState,
} from "./storage"

const createLocalStorage = () => {
  const values = new Map<string, string>()

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key)
    }),
  }
}

const setLocalStorage = (storage: ReturnType<typeof createLocalStorage>) => {
  vi.stubGlobal("localStorage", storage)
}

afterEach(() => {
  clearGameState("word-0001")
  clearGameState("word-0002")
  vi.unstubAllGlobals()
})

describe("semantic guess storage", () => {
  it("persists game state by puzzle id", () => {
    setLocalStorage(createLocalStorage())

    saveGameState("word-0001", {
      won: true,
      guesses: [{ id: 1, word: "water", score: 100, rank: 1 }],
    })

    expect(loadGameState("word-0001")).toEqual({
      won: true,
      guesses: [{ id: 1, word: "water", score: 100, rank: 1 }],
    })
    expect(loadGameState("word-0002")).toBeNull()
  })

  it("ignores malformed persisted state", () => {
    const storage = createLocalStorage()
    setLocalStorage(storage)
    storage.setItem("portlly:semantic-guess:word-0001", '{"won":"yes"}')

    expect(loadGameState("word-0001")).toBeNull()
  })

  it("keeps an anonymous id stable once minted", () => {
    setLocalStorage(createLocalStorage())

    const anonId = getOrCreateAnonId()

    expect(anonId).toBeTruthy()
    expect(getOrCreateAnonId()).toBe(anonId)
  })

  it("falls back to memory storage when localStorage writes fail", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error("blocked")
      }),
      removeItem: vi.fn(() => {
        throw new Error("blocked")
      }),
    })

    saveGameState("word-0001", {
      won: false,
      guesses: [{ id: 7, word: "boat", score: 91.67, rank: 3 }],
    })

    expect(loadGameState("word-0001")).toEqual({
      won: false,
      guesses: [{ id: 7, word: "boat", score: 91.67, rank: 3 }],
    })
  })
})
