import { applyTimeDelta, scoreAnswer } from "./engine"
import type { TickrQuestion, TickrRunState, TickrTimerPreset } from "./types"

export type TickrRunAction =
  | { type: "startRun"; presetSeconds: TickrTimerPreset }
  | {
      type: "answer"
      question: TickrQuestion
      choice: string
      correctTimeBonus: number
      wrongTimePenalty: number
    }
  | { type: "tick"; deltaSeconds: number }
  | { type: "endRun" }
  | { type: "reset" }

export const createTickrRunState = (): TickrRunState => ({
  status: "idle",
  presetSeconds: null,
  clockSeconds: 0,
  elapsedSeconds: 0,
  questionIndex: 0,
  correctCount: 0,
  wrongCount: 0,
  currentStreak: 0,
  bestStreak: 0,
  seenIds: [],
  lastAnswer: null,
})

const uniqueSeenIds = (seenIds: string[], questionId: string) =>
  seenIds.includes(questionId) ? seenIds : [...seenIds, questionId]

export const tickrRunReducer = (
  state: TickrRunState,
  action: TickrRunAction
): TickrRunState => {
  if (action.type === "reset") {
    return createTickrRunState()
  }

  if (action.type === "startRun") {
    return {
      ...createTickrRunState(),
      status: "running",
      presetSeconds: action.presetSeconds,
      clockSeconds: action.presetSeconds,
    }
  }

  if (action.type === "endRun") {
    return {
      ...state,
      status: "ended",
      clockSeconds: 0,
    }
  }

  if (state.status !== "running" || state.presetSeconds === null) {
    return state
  }

  if (action.type === "tick") {
    const deltaSeconds = Math.max(0, action.deltaSeconds)
    const clockSeconds = applyTimeDelta(
      state.clockSeconds,
      -deltaSeconds,
      state.presetSeconds
    )

    return {
      ...state,
      status: clockSeconds <= 0 ? "ended" : "running",
      clockSeconds,
      elapsedSeconds: state.elapsedSeconds + deltaSeconds,
    }
  }

  const score = scoreAnswer(action.question, action.choice)
  const timeDelta = score.correct
    ? action.correctTimeBonus
    : -action.wrongTimePenalty
  const clockAfter = applyTimeDelta(
    state.clockSeconds,
    timeDelta,
    state.presetSeconds
  )
  const currentStreak = score.correct ? state.currentStreak + 1 : 0

  return {
    ...state,
    status: clockAfter <= 0 ? "ended" : "running",
    clockSeconds: clockAfter,
    questionIndex: state.questionIndex + 1,
    correctCount: state.correctCount + (score.correct ? 1 : 0),
    wrongCount: state.wrongCount + (score.correct ? 0 : 1),
    currentStreak,
    bestStreak: Math.max(state.bestStreak, currentStreak),
    seenIds: uniqueSeenIds(state.seenIds, action.question.id),
    lastAnswer: {
      ...score,
      timeDelta,
      clockBefore: state.clockSeconds,
      clockAfter,
    },
  }
}
