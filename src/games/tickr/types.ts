export const tickrDifficulties = ["easy", "medium", "hard"] as const

export type TickrDifficulty = (typeof tickrDifficulties)[number]

export type TickrQuestion = {
  id: string
  question: string
  correct: string
  options: [string, string, string, string]
  category: "General Knowledge"
  difficulty: TickrDifficulty
}

export type TickrQuestionManifest = {
  version: number
  gameId: "tickr"
  source: "OpenTDB"
  category: "General Knowledge"
  categoryId: 9
  questionCount: number
  buckets: Record<
    TickrDifficulty,
    {
      fileName: `${TickrDifficulty}.json`
      count: number
    }
  >
}
