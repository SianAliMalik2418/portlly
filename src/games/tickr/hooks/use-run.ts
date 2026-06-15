import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { tickrConfig } from "../config"
import { difficultyForIndex, scoreAnswer } from "../engine"
import { loadBucket, nextQuestion, prefetchBucket } from "../lib/bank"
import { createTickrRunState, tickrRunReducer } from "../state"
import type { TickrQuestion, TickrTimerPreset } from "../types"

type RunPhase = "start" | "loading" | "running" | "ended"

const getQuestionDifficulty = (questionIndex: number) =>
  difficultyForIndex(questionIndex + 1, tickrConfig.difficultyThresholds)

export const useRun = () => {
  const [state, dispatch] = useReducer(
    tickrRunReducer,
    undefined,
    createTickrRunState
  )
  const [phase, setPhase] = useState<RunPhase>("start")
  const [currentQuestion, setCurrentQuestion] = useState<TickrQuestion | null>(
    null
  )
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const answeringRef = useRef(false)

  const pickQuestion = useCallback(
    async (questionIndex: number, seenIds: string[]) => {
      const difficulty = getQuestionDifficulty(questionIndex)
      setLoadingMessage(`Loading ${difficulty} questions`)
      await loadBucket(difficulty)

      if (difficulty === "easy") {
        prefetchBucket("medium")
        prefetchBucket("hard")
      }

      const question = nextQuestion(difficulty, new Set(seenIds))
      setCurrentQuestion(question)
      setLoadingMessage(
        question ? null : `No ${difficulty} questions available`
      )

      return question
    },
    []
  )

  const startRun = useCallback(
    async (presetSeconds: TickrTimerPreset) => {
      setPhase("loading")
      dispatch({ type: "startRun", presetSeconds })
      try {
        const question = await pickQuestion(0, [])
        setPhase(question ? "running" : "start")
      } catch {
        dispatch({ type: "reset" })
        setLoadingMessage("Question bank unavailable")
        setPhase("start")
      }
    },
    [pickQuestion]
  )

  const answer = useCallback(
    async (choice: string) => {
      if (
        !currentQuestion ||
        state.status !== "running" ||
        answeringRef.current
      ) {
        return
      }

      answeringRef.current = true
      const score = scoreAnswer(currentQuestion, choice)
      const timeDelta = score.correct
        ? tickrConfig.correctTimeBonus
        : -tickrConfig.wrongTimePenalty
      const willEnd = state.clockSeconds + timeDelta <= 0
      const nextSeenIds = state.seenIds.includes(currentQuestion.id)
        ? state.seenIds
        : [...state.seenIds, currentQuestion.id]
      const nextQuestionIndex = state.questionIndex + 1

      dispatch({
        type: "answer",
        question: currentQuestion,
        choice,
        correctTimeBonus: tickrConfig.correctTimeBonus,
        wrongTimePenalty: tickrConfig.wrongTimePenalty,
      })

      if (willEnd) {
        setCurrentQuestion(null)
        setPhase("ended")
        answeringRef.current = false
        return
      }

      try {
        const question = await pickQuestion(nextQuestionIndex, nextSeenIds)
        if (!question) {
          dispatch({ type: "endRun" })
          setPhase("ended")
        }
      } catch {
        dispatch({ type: "endRun" })
        setPhase("ended")
        setLoadingMessage("Question bank unavailable")
      } finally {
        answeringRef.current = false
      }
    },
    [currentQuestion, pickQuestion, state]
  )

  const reset = useCallback(() => {
    answeringRef.current = false
    setCurrentQuestion(null)
    setLoadingMessage(null)
    setPhase("start")
    dispatch({ type: "reset" })
  }, [])

  useEffect(() => {
    if (state.status === "ended" && phase !== "start") {
      setPhase("ended")
      setCurrentQuestion(null)
    }
  }, [phase, state.status])

  useEffect(() => {
    if (state.status !== "running") return

    let frameId = 0
    let previousTime = performance.now()

    const tick = (time: number) => {
      const deltaSeconds = Math.max(0, (time - previousTime) / 1000)
      previousTime = time
      dispatch({ type: "tick", deltaSeconds })
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [state.status])

  return {
    phase,
    state,
    currentQuestion,
    loadingMessage,
    startRun,
    answer,
    reset,
  }
}
