import { describe, expect, it } from "vitest"
import { getTodaysPuzzle } from "./puzzle"

const makeFetchResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  })

describe("getTodaysPuzzle", () => {
  it("fetches and validates today's puzzle", async () => {
    const fetcher: typeof fetch = async (input) => {
      expect(input).toBe("/api/puzzles/today")

      return makeFetchResponse({
        version: 1,
        puzzleId: "word-0001",
        answerHash: "abc123",
        scoreScale: "max(0, cosine) * 100",
        warmBandSize: 5000,
        scores: { bread: 62.1 },
        ranks: { bread: 42 },
      })
    }

    await expect(getTodaysPuzzle(fetcher)).resolves.toMatchObject({
      puzzleId: "word-0001",
      scores: { bread: 62.1 },
    })
  })

  it("rejects failed responses", async () => {
    const fetcher: typeof fetch = async () =>
      makeFetchResponse({ error: "missing" }, { status: 404 })

    await expect(getTodaysPuzzle(fetcher)).rejects.toThrow(
      "Failed to fetch today's puzzle: 404"
    )
  })

  it("rejects invalid puzzle shapes", async () => {
    const fetcher: typeof fetch = async () =>
      makeFetchResponse({ puzzleId: "word-0001" })

    await expect(getTodaysPuzzle(fetcher)).rejects.toThrow(
      "Puzzle response had an unexpected shape"
    )
  })
})
