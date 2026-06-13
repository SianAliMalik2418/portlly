import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { todaysPuzzleQueryOptions } from "../data/puzzle"
import { scoreGuess } from "../engine"
import { wordGameReducer, createWordGameState } from "../state"
import type { WordGuess } from "../types"
import { getStatusMessage, sortGuesses } from "../lib/presentation"
import {
  clearGameState,
  getOrCreateAnonId,
  loadGameState,
  saveGameState,
} from "../lib/storage"

export const useGameState = () => {
  const {
    data: puzzle,
    isPending,
    error,
  } = useQuery(todaysPuzzleQueryOptions())

  const [state, dispatch] = useReducer(
    wordGameReducer,
    undefined,
    createWordGameState
  )
  const [input, setInput] = useState("")
  const [shake, setShake] = useState(false)
  const [shakingGuessId, setShakingGuessId] = useState<number | null>(null)
  const [showWin, setShowWin] = useState(false)
  const [hydratedPuzzleId, setHydratedPuzzleId] = useState<string | null>(null)

  useEffect(() => {
    getOrCreateAnonId()
  }, [])

  useEffect(() => {
    if (!puzzle || hydratedPuzzleId === puzzle.puzzleId) return

    const saved = loadGameState(puzzle.puzzleId)

    if (saved) {
      dispatch({ type: "hydrate", guesses: saved.guesses, solved: saved.won })
      setShowWin(saved.won)
    } else {
      dispatch({ type: "reset" })
      setShowWin(false)
    }

    setInput("")
    setToast("")
    setHydratedPuzzleId(puzzle.puzzleId)
  }, [puzzle, hydratedPuzzleId])

  useEffect(() => {
    if (!puzzle || hydratedPuzzleId !== puzzle.puzzleId) return

    saveGameState(puzzle.puzzleId, {
      guesses: state.guesses,
      won: state.solved,
    })
  }, [puzzle, hydratedPuzzleId, state.guesses, state.solved])

  const bestScore = useMemo(
    () =>
      state.guesses.length === 0
        ? null
        : state.guesses.reduce((m, g) => Math.max(m, g.score), -Infinity),
    [state.guesses]
  )

  const bestGuess = useMemo(
    () =>
      state.guesses.reduce<WordGuess | null>(
        (b, g) => (!b || g.score > b.score ? g : b),
        null
      ),
    [state.guesses]
  )

  const status = useMemo(
    () => getStatusMessage(bestScore, bestGuess),
    [bestScore, bestGuess]
  )

  const sortedGuesses = useMemo(
    () => sortGuesses(state.guesses),
    [state.guesses]
  )

  const triggerShake = useCallback(() => {
    setShake(true)
    setTimeout(() => setShake(false), 340)
  }, [])

  const triggerGuessShake = useCallback((guessId: number) => {
    setShakingGuessId(guessId)
    setTimeout(() => setShakingGuessId(null), 340)
  }, [])

  const submit = useCallback(() => {
    const word = input.trim()
    if (!word || !puzzle || state.solved) return

    const result = scoreGuess(word, puzzle)

    if (result.status === "unknown") {
      triggerShake()
      toast.error(`"${result.word}" is not in our word list`)
      setInput("")
      return
    }

    const duplicate = state.guesses.find((g) => g.word === result.word)
    if (duplicate) {
      triggerGuessShake(duplicate.id)
      toast(`Already tried "${result.word}"`)
      setInput("")
      return
    }

    dispatch({ type: "submitGuess", guess: word, puzzle })
    setInput("")

    if (result.status === "win") {
      setTimeout(() => setShowWin(true), 380)
    }
  }, [input, puzzle, state.solved, state.guesses, triggerShake, triggerGuessShake])

  const reset = useCallback(() => {
    if (!puzzle) return
    dispatch({ type: "reset" })
    setShowWin(false)
    setInput("")
    clearGameState(puzzle.puzzleId)
  }, [puzzle])

  return {
    puzzle,
    isPending,
    error,
    guesses: state.guesses,
    sortedGuesses,
    latestId: state.highlightedGuessId,
    input,
    setInput,
    shake,
    shakingGuessId,
    won: state.solved,
    showWin,
    setShowWin,
    bestScore,
    bestGuess,
    status,
    submit,
    reset,
  }
}
