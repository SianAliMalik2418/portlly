import { queryOptions } from "@tanstack/react-query"

export type WordPuzzle = {
  version: number
  puzzleId: string
  answerHash: string
  scoreScale: string
  warmBandSize: number
  scores: Record<string, number>
  ranks: Record<string, number>
}

export const todaysPuzzleQueryKey = ["word", "puzzle", "today"] as const

const assertPuzzle = (value: unknown): WordPuzzle => {
  if (!value || typeof value !== "object") {
    throw new Error("Puzzle response was not an object")
  }

  const puzzle = value as Partial<WordPuzzle>

  if (
    typeof puzzle.puzzleId !== "string" ||
    typeof puzzle.answerHash !== "string" ||
    typeof puzzle.scoreScale !== "string" ||
    typeof puzzle.warmBandSize !== "number" ||
    !puzzle.scores ||
    typeof puzzle.scores !== "object" ||
    !puzzle.ranks ||
    typeof puzzle.ranks !== "object"
  ) {
    throw new Error("Puzzle response had an unexpected shape")
  }

  return puzzle as WordPuzzle
}

export const getTodaysPuzzle = async (
  fetcher: typeof fetch = fetch
): Promise<WordPuzzle> => {
  const response = await fetcher("/api/puzzles/today", {
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch today's puzzle: ${response.status}`)
  }

  return assertPuzzle(await response.json())
}

export const todaysPuzzleQueryOptions = () =>
  queryOptions({
    queryKey: todaysPuzzleQueryKey,
    queryFn: () => getTodaysPuzzle(),
    staleTime: 5 * 60 * 1000,
  })
