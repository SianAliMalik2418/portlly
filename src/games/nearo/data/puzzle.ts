import { queryOptions } from "@tanstack/react-query"
import type { WordPuzzle } from "../types"

export type { WordPuzzle } from "../types"

export type ArchiveDay = {
  date: string
  puzzleId: string
  isToday: boolean
}

export const todaysPuzzleQueryKey = ["word", "puzzle", "today"] as const
export const archiveDaysQueryKey = ["word", "archive-days"] as const
export const puzzleDateQueryKey = (date: string) =>
  ["word", "puzzle", "date", date] as const

const assertPuzzle = (value: unknown): WordPuzzle => {
  if (!value || typeof value !== "object") {
    throw new Error("Puzzle response was not an object")
  }

  const puzzle = value as Partial<WordPuzzle>

  if (
    typeof puzzle.puzzleId !== "string" ||
    typeof puzzle.answerHash !== "string" ||
    typeof puzzle.scoreScale !== "string" ||
    typeof puzzle.rankBandSize !== "number" ||
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
    cache: "no-store",
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

export const getPuzzleByDate = async (
  date: string,
  fetcher: typeof fetch = fetch
): Promise<WordPuzzle> => {
  const response = await fetcher(
    `/api/puzzles/day?${new URLSearchParams({ date }).toString()}`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch puzzle for ${date}: ${response.status}`)
  }

  return assertPuzzle(await response.json())
}

export const puzzleDateQueryOptions = (date: string) =>
  queryOptions({
    queryKey: puzzleDateQueryKey(date),
    queryFn: () => getPuzzleByDate(date),
    staleTime: 5 * 60 * 1000,
  })

const assertArchiveDays = (value: unknown): ArchiveDay[] => {
  if (!value || typeof value !== "object") {
    throw new Error("Archive response was not an object")
  }

  const archive = value as { days?: unknown }

  if (!Array.isArray(archive.days)) {
    throw new Error("Archive response had an unexpected shape")
  }

  return archive.days.map((day) => {
    if (!day || typeof day !== "object") {
      throw new Error("Archive day had an unexpected shape")
    }

    const archiveDay = day as Partial<ArchiveDay>

    if (
      typeof archiveDay.date !== "string" ||
      typeof archiveDay.puzzleId !== "string" ||
      typeof archiveDay.isToday !== "boolean"
    ) {
      throw new Error("Archive day had an unexpected shape")
    }

    return archiveDay as ArchiveDay
  })
}

export const getArchiveDays = async (
  fetcher: typeof fetch = fetch
): Promise<ArchiveDay[]> => {
  const response = await fetcher("/api/puzzles/archive", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch archive days: ${response.status}`)
  }

  return assertArchiveDays(await response.json())
}

export const archiveDaysQueryOptions = () =>
  queryOptions({
    queryKey: archiveDaysQueryKey,
    queryFn: () => getArchiveDays(),
    staleTime: 5 * 60 * 1000,
  })
