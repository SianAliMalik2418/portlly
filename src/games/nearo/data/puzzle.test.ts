import { describe, expect, it } from "vitest"
import { getArchiveDays, getPuzzleByDate, getTodaysPuzzle } from "./puzzle"

const makeFetchResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  })

const puzzleBody = {
  version: 1,
  puzzleId: "word-0001",
  answerHash: "abc123",
  scoreScale: "max(0, cosine) * 100",
  rankBandSize: 5000,
  scores: { bread: 62.1 },
  ranks: { bread: 42 },
}

describe("getTodaysPuzzle", () => {
  it("fetches and validates today's puzzle", async () => {
    const fetcher: typeof fetch = async (input, init) => {
      expect(input).toBe("/api/puzzles/today")
      expect(init).toMatchObject({ cache: "no-store" })

      return makeFetchResponse(puzzleBody)
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

describe("getPuzzleByDate", () => {
  it("fetches a dated puzzle", async () => {
    const fetcher: typeof fetch = async (input, init) => {
      expect(input).toBe("/api/puzzles/day?date=2026-06-12")
      expect(init).toMatchObject({ cache: "no-store" })

      return makeFetchResponse({ ...puzzleBody, puzzleId: "word-0002" })
    }

    await expect(getPuzzleByDate("2026-06-12", fetcher)).resolves.toMatchObject(
      {
        puzzleId: "word-0002",
      }
    )
  })
})

describe("getArchiveDays", () => {
  it("fetches and validates archive days", async () => {
    const fetcher: typeof fetch = async (input, init) => {
      expect(input).toBe("/api/puzzles/archive")
      expect(init).toMatchObject({ cache: "no-store" })

      return makeFetchResponse({
        days: [
          { date: "2026-06-13", puzzleId: "word-0007", isToday: true },
          { date: "2026-06-12", puzzleId: "word-0006", isToday: false },
        ],
      })
    }

    await expect(getArchiveDays(fetcher)).resolves.toEqual([
      { date: "2026-06-13", puzzleId: "word-0007", isToday: true },
      { date: "2026-06-12", puzzleId: "word-0006", isToday: false },
    ])
  })

  it("rejects malformed archive responses", async () => {
    const fetcher: typeof fetch = async () => makeFetchResponse({ days: [{}] })

    await expect(getArchiveDays(fetcher)).rejects.toThrow(
      "Archive day had an unexpected shape"
    )
  })
})
