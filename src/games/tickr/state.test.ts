import { describe, expect, it } from "vitest"
import { createTickrRunState, tickrRunReducer } from "./state"
import type { TickrQuestion, TickrRunState } from "./types"

const question = (id: string, correct = "Correct"): TickrQuestion => ({
  id,
  question: `Question ${id}?`,
  correct,
  options: [correct, "Wrong 1", "Wrong 2", "Wrong 3"],
  category: "General Knowledge",
  difficulty: "easy",
})

const startRun = (presetSeconds = 30) =>
  tickrRunReducer(createTickrRunState(), {
    type: "startRun",
    presetSeconds,
  })

const answer = (
  state: TickrRunState,
  choice: string,
  currentQuestion = question("one")
) =>
  tickrRunReducer(state, {
    type: "answer",
    question: currentQuestion,
    choice,
    correctTimeBonus: 5,
    wrongTimePenalty: 8,
  })

describe("tickrRunReducer", () => {
  it("starts a run from a timer preset", () => {
    expect(startRun(60)).toMatchObject({
      status: "running",
      presetSeconds: 60,
      clockSeconds: 60,
      elapsedSeconds: 0,
      correctCount: 0,
      questionIndex: 0,
    })
  })

  it("adds time for correct answers without exceeding the preset ceiling", () => {
    const state = answer(startRun(30), "Correct")

    expect(state.clockSeconds).toBe(30)
    expect(state.correctCount).toBe(1)
    expect(state.wrongCount).toBe(0)
    expect(state.questionIndex).toBe(1)
    expect(state.currentStreak).toBe(1)
    expect(state.bestStreak).toBe(1)
    expect(state.lastAnswer).toMatchObject({
      correct: true,
      timeDelta: 5,
      clockBefore: 30,
      clockAfter: 30,
    })
  })

  it("subtracts time for wrong answers and resets the current streak", () => {
    const first = answer(startRun(30), "Correct", question("one"))
    const second = answer(first, "Wrong 1", question("two"))

    expect(second.clockSeconds).toBe(22)
    expect(second.correctCount).toBe(1)
    expect(second.wrongCount).toBe(1)
    expect(second.currentStreak).toBe(0)
    expect(second.bestStreak).toBe(1)
    expect(second.seenIds).toEqual(["one", "two"])
    expect(second.lastAnswer).toMatchObject({
      correct: false,
      timeDelta: -8,
      clockBefore: 30,
      clockAfter: 22,
    })
  })

  it("ends the run when a wrong answer floors the timer", () => {
    const nearDeath = tickrRunReducer(startRun(30), {
      type: "tick",
      deltaSeconds: 27,
    })
    const ended = answer(nearDeath, "Wrong 1")

    expect(ended.status).toBe("ended")
    expect(ended.clockSeconds).toBe(0)
  })

  it("ticks elapsed time down to timer death", () => {
    const running = tickrRunReducer(startRun(30), {
      type: "tick",
      deltaSeconds: 12.5,
    })

    expect(running.status).toBe("running")
    expect(running.clockSeconds).toBe(17.5)
    expect(running.elapsedSeconds).toBe(12.5)

    const ended = tickrRunReducer(running, {
      type: "tick",
      deltaSeconds: 20,
    })

    expect(ended.status).toBe("ended")
    expect(ended.clockSeconds).toBe(0)
    expect(ended.elapsedSeconds).toBe(32.5)
  })

  it("ignores gameplay actions outside a running state", () => {
    const idle = createTickrRunState()

    expect(answer(idle, "Correct")).toBe(idle)
    expect(tickrRunReducer(idle, { type: "tick", deltaSeconds: 3 })).toBe(idle)
  })
})
