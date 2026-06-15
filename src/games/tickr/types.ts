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

export type TickrTimerPreset = number

export type TickrDifficultyThresholds = {
  medium: number
  hard: number
}

export type TickrAnswerScore = {
  correct: boolean
  questionId: string
  choice: string
  correctAnswer: string
}

export type TickrLastAnswer = TickrAnswerScore & {
  timeDelta: number
  clockBefore: number
  clockAfter: number
}

export type TickrRunStatus = "idle" | "running" | "ended"

export type TickrRunState = {
  status: TickrRunStatus
  presetSeconds: TickrTimerPreset | null
  clockSeconds: number
  elapsedSeconds: number
  questionIndex: number
  correctCount: number
  wrongCount: number
  currentStreak: number
  bestStreak: number
  seenIds: string[]
  lastAnswer: TickrLastAnswer | null
}

export type TickrRunResult = {
  presetSeconds: TickrTimerPreset
  correctCount: number
  wrongCount: number
  elapsedSeconds: number
  bestStreak: number
  previousBest: number | null
  bestScore: number
  newBest: boolean
}
