import type {
  TickrAnswerScore,
  TickrDifficulty,
  TickrDifficultyThresholds,
  TickrQuestion,
} from "./types"

export const scoreAnswer = (
  question: TickrQuestion,
  choice: string
): TickrAnswerScore => ({
  correct: choice === question.correct,
  questionId: question.id,
  choice,
  correctAnswer: question.correct,
})

export const applyTimeDelta = (
  clockSeconds: number,
  deltaSeconds: number,
  ceilingSeconds: number
) => Math.min(Math.max(clockSeconds + deltaSeconds, 0), ceilingSeconds)

export const difficultyForIndex = (
  questionNumber: number,
  thresholds: TickrDifficultyThresholds
): TickrDifficulty => {
  if (questionNumber >= thresholds.hard) return "hard"
  if (questionNumber >= thresholds.medium) return "medium"
  return "easy"
}
