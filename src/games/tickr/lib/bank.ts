import { getQuestionBucket } from "../data/questions"
import type { TickrDifficulty, TickrQuestion } from "../types"

const bucketCache = new Map<TickrDifficulty, TickrQuestion[]>()
const bucketPromises = new Map<TickrDifficulty, Promise<TickrQuestion[]>>()

export const loadBucket = async (
  difficulty: TickrDifficulty,
  fetcher: typeof getQuestionBucket = getQuestionBucket
) => {
  const cached = bucketCache.get(difficulty)
  if (cached) return cached

  const inFlight = bucketPromises.get(difficulty)
  if (inFlight) return inFlight

  const promise = fetcher(difficulty)
    .then((questions) => {
      bucketCache.set(difficulty, questions)
      return questions
    })
    .finally(() => {
      bucketPromises.delete(difficulty)
    })

  bucketPromises.set(difficulty, promise)

  return promise
}

export const prefetchBucket = (
  difficulty: TickrDifficulty,
  fetcher: typeof getQuestionBucket = getQuestionBucket
) => {
  void loadBucket(difficulty, fetcher).catch(() => {})
}

export const setLoadedBucket = (
  difficulty: TickrDifficulty,
  questions: TickrQuestion[]
) => {
  bucketCache.set(difficulty, questions)
}

export const nextQuestion = (
  difficulty: TickrDifficulty,
  seenIds: ReadonlySet<string>,
  random: () => number = Math.random
): TickrQuestion | null => {
  const bucket = bucketCache.get(difficulty)
  if (!bucket || bucket.length === 0) return null

  const unseen = bucket.filter((question) => !seenIds.has(question.id))
  const pool = unseen.length > 0 ? unseen : bucket
  const index = Math.floor(random() * pool.length)

  return pool[index] ?? null
}

export const clearQuestionBankCache = () => {
  bucketCache.clear()
  bucketPromises.clear()
}
