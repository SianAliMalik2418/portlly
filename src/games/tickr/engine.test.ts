import { describe, expect, it } from "vitest"
import { applyTimeDelta, difficultyForIndex, scoreAnswer } from "./engine"
import type { TickrQuestion } from "./types"

const question: TickrQuestion = {
  id: "tickr-one",
  question: "Which color is made by mixing blue and yellow?",
  correct: "Green",
  options: ["Green", "Purple", "Orange", "Brown"],
  category: "General Knowledge",
  difficulty: "easy",
}

describe("Tickr engine", () => {
  it("scores exact multiple-choice answers", () => {
    expect(scoreAnswer(question, "Green")).toEqual({
      correct: true,
      questionId: "tickr-one",
      choice: "Green",
      correctAnswer: "Green",
    })

    expect(scoreAnswer(question, "Purple")).toMatchObject({
      correct: false,
      choice: "Purple",
      correctAnswer: "Green",
    })
  })

  it("applies time deltas within floor and ceiling clamps", () => {
    expect(applyTimeDelta(20, 5, 30)).toBe(25)
    expect(applyTimeDelta(28, 5, 30)).toBe(30)
    expect(applyTimeDelta(3, -8, 30)).toBe(0)
  })

  it("maps question numbers to deterministic difficulty thresholds", () => {
    const thresholds = { medium: 6, hard: 16 }

    expect(difficultyForIndex(1, thresholds)).toBe("easy")
    expect(difficultyForIndex(5, thresholds)).toBe("easy")
    expect(difficultyForIndex(6, thresholds)).toBe("medium")
    expect(difficultyForIndex(15, thresholds)).toBe("medium")
    expect(difficultyForIndex(16, thresholds)).toBe("hard")
  })
})
