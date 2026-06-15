import { beforeEach, describe, expect, it } from "vitest"
import {
  clearTickrStorage,
  loadBestScore,
  loadSeenQuestionIds,
  saveBestScore,
  saveSeenQuestionIds,
} from "./storage"

describe("Tickr storage", () => {
  beforeEach(() => {
    clearTickrStorage()
  })

  it("stores best scores per timer preset", () => {
    expect(loadBestScore(30)).toBeNull()

    saveBestScore(30, 12)
    saveBestScore(60, 7)

    expect(loadBestScore(30)).toBe(12)
    expect(loadBestScore(60)).toBe(7)
    expect(loadBestScore(90)).toBeNull()
  })

  it("stores unique seen question ids", () => {
    saveSeenQuestionIds(["a", "b", "a", "c"])

    expect(loadSeenQuestionIds()).toEqual(["a", "b", "c"])
  })
})
