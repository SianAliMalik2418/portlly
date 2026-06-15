import { beforeEach, describe, expect, it } from "vitest"
import {
  clearQuestionBankCache,
  loadBucket,
  nextQuestion,
  prefetchBucket,
  setLoadedBucket,
} from "./bank"
import type { TickrDifficulty, TickrQuestion } from "../types"

const question = (
  id: string,
  difficulty: TickrDifficulty = "easy"
): TickrQuestion => ({
  id,
  question: `Question ${id}?`,
  correct: "Correct",
  options: ["Correct", "Wrong 1", "Wrong 2", "Wrong 3"],
  category: "General Knowledge",
  difficulty,
})

describe("Tickr question bank", () => {
  beforeEach(() => {
    clearQuestionBankCache()
  })

  it("loads a bucket once and reuses it from memory", async () => {
    let calls = 0
    const fetcher = async () => {
      calls += 1
      return [question("one")]
    }

    await expect(loadBucket("easy", fetcher)).resolves.toHaveLength(1)
    await expect(loadBucket("easy", fetcher)).resolves.toHaveLength(1)

    expect(calls).toBe(1)
  })

  it("prefetches a bucket into memory", async () => {
    prefetchBucket("medium", async () => [question("two", "medium")])

    await expect(loadBucket("medium")).resolves.toEqual([
      question("two", "medium"),
    ])
  })

  it("picks unseen questions first and reshuffles when all are seen", () => {
    setLoadedBucket("hard", [question("a", "hard"), question("b", "hard")])

    expect(nextQuestion("hard", new Set(["a"]), () => 0)?.id).toBe("b")
    expect(nextQuestion("hard", new Set(["a", "b"]), () => 0)?.id).toBe("a")
  })
})
