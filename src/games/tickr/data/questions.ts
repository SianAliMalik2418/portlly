import { queryOptions } from "@tanstack/react-query"
import {
  tickrDifficulties,
  type TickrDifficulty,
  type TickrQuestion,
} from "../types"

export type { TickrDifficulty, TickrQuestion } from "../types"

export const tickrQuestionBucketQueryKey = (difficulty: TickrDifficulty) =>
  ["tickr", "questions", difficulty] as const

export const isTickrDifficulty = (value: string): value is TickrDifficulty =>
  tickrDifficulties.includes(value as TickrDifficulty)

const isTickrQuestion = (
  value: unknown,
  difficulty: TickrDifficulty
): value is TickrQuestion => {
  if (!value || typeof value !== "object") return false

  const question = value as Partial<TickrQuestion>

  return (
    typeof question.id === "string" &&
    typeof question.question === "string" &&
    typeof question.correct === "string" &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every((option) => typeof option === "string") &&
    question.category === "General Knowledge" &&
    question.difficulty === difficulty
  )
}

export const assertQuestionBucket = (
  value: unknown,
  difficulty: TickrDifficulty
): TickrQuestion[] => {
  if (!Array.isArray(value)) {
    throw new Error("Question bucket response was not an array")
  }

  if (!value.every((question) => isTickrQuestion(question, difficulty))) {
    throw new Error("Question bucket response had an unexpected shape")
  }

  return value
}

export const getQuestionBucket = async (
  difficulty: TickrDifficulty,
  fetcher: typeof fetch = fetch
): Promise<TickrQuestion[]> => {
  const response = await fetcher(
    `/api/tickr/questions?${new URLSearchParams({ difficulty }).toString()}`,
    {
      headers: { Accept: "application/json" },
    }
  )

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Tickr ${difficulty} questions: ${response.status}`
    )
  }

  return assertQuestionBucket(await response.json(), difficulty)
}

export const tickrQuestionBucketQueryOptions = (difficulty: TickrDifficulty) =>
  queryOptions({
    queryKey: tickrQuestionBucketQueryKey(difficulty),
    queryFn: () => getQuestionBucket(difficulty),
    staleTime: 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
  })
