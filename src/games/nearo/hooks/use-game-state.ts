import { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { getPuzzleByDate, getTodaysPuzzle } from "../data/puzzle"
import { scoreGuess } from "../engine"
import { wordGameReducer, createWordGameState } from "../state"
import type { WordGuess, WordPuzzle } from "../types"
import { nearoConfig } from "../config"
import { getStatusMessage, sortGuesses } from "../lib/presentation"
import {
  clearGameState,
  getOrCreateAnonId,
  loadGameState,
  saveGameState,
} from "../lib/storage"

const pickStarterWord = (puzzle: WordPuzzle): string | null => {
  const entries = Object.entries(puzzle.scores)
  const candidates = entries.filter(([, s]) => s >= 15 && s <= 35)
  if (candidates.length === 0) return entries.length > 0 ? entries[0][0] : null
  const hash = puzzle.puzzleId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return candidates[hash % candidates.length][0]
}

type GameMode = "daily" | "archive"

type UseGameStateOptions = {
  mode: GameMode
  date?: string
}

export const useGameState = ({ mode, date }: UseGameStateOptions) => {
  const {
    data: puzzle,
    isPending,
    isFetching,
    error,
  } = useQuery({
    queryKey:
      mode === "archive" && date
        ? (["word", "puzzle", "date", date] as const)
        : (["word", "puzzle", "daily"] as const),
    queryFn:
      mode === "archive" && date
        ? () => getPuzzleByDate(date)
        : () => getTodaysPuzzle(),
    enabled: mode === "daily" || Boolean(date),
    staleTime: 5 * 60 * 1000,
  })

  const [state, dispatch] = useReducer(
    wordGameReducer,
    undefined,
    createWordGameState
  )
  const [input, setInput] = useState("")
  const [shake, setShake] = useState(false)
  const [shakingGuessId, setShakingGuessId] = useState<number | null>(null)
  const [pinnedGuessId, setPinnedGuessId] = useState<number | null>(null)
  const [showWin, setShowWin] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
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
      setHintsUsed(saved.hintsUsed ?? 0)
    } else {
      dispatch({ type: "reset" })
      setShowWin(false)
      setHintsUsed(0)
      const starter = pickStarterWord(puzzle)
      setInput(starter ?? "")
      setHydratedPuzzleId(puzzle.puzzleId)
      return
    }

    setInput("")
    setHydratedPuzzleId(puzzle.puzzleId)
  }, [puzzle, hydratedPuzzleId])

  useEffect(() => {
    if (!puzzle || hydratedPuzzleId !== puzzle.puzzleId) return

    saveGameState(puzzle.puzzleId, {
      guesses: state.guesses,
      won: state.solved,
      hintsUsed,
    })
  }, [hintsUsed, puzzle, hydratedPuzzleId, state.guesses, state.solved])

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

  const status = useMemo(() => getStatusMessage(bestScore), [bestScore])

  useEffect(() => {
    if (state.highlightedGuessId === null || state.solved) return
    const guess = state.guesses.find((g) => g.id === state.highlightedGuessId)
    if (!guess) return

    setPinnedGuessId(guess.id)
    const timer = setTimeout(() => setPinnedGuessId(null), 1200)
    return () => clearTimeout(timer)
  }, [state.highlightedGuessId, state.solved, state.guesses])

  const sortedGuesses = useMemo(() => {
    const sorted = sortGuesses(state.guesses)
    if (pinnedGuessId === null) return sorted
    const pinned = sorted.find((g) => g.id === pinnedGuessId)
    if (!pinned) return sorted
    return [pinned, ...sorted.filter((g) => g.id !== pinnedGuessId)]
  }, [state.guesses, pinnedGuessId])

  const triggerShake = useCallback(() => {
    setShake(true)
    setTimeout(() => setShake(false), 340)
  }, [])

  const triggerGuessShake = useCallback((guessId: number) => {
    setShakingGuessId(guessId)
    setTimeout(() => setShakingGuessId(null), 340)
  }, [])

  const maxHints = Math.floor(
    state.guesses.length / nearoConfig.hintThreshold
  )
  const canHint = !state.solved && hintsUsed < maxHints

  const hint = useCallback(() => {
    if (!puzzle || !canHint) return
    const currentBest = bestScore ?? 0
    const floor = currentBest + 5
    const ceiling = 85
    if (floor >= ceiling) return

    const guessedWords = new Set(state.guesses.map((g) => g.word))
    const candidates = Object.entries(puzzle.scores)
      .filter(
        ([word, score]) =>
          !guessedWords.has(word) && score > floor && score <= ceiling
      )
      .sort((a, b) => a[1] - b[1])

    if (candidates.length === 0) return
    const pick = candidates[Math.floor(candidates.length * 0.3)]
    dispatch({ type: "submitGuess", guess: pick[0], puzzle })
    setHintsUsed((prev) => prev + 1)
  }, [puzzle, canHint, bestScore, state.guesses])

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
      toast.warning(`Already tried "${result.word}"`)
      setInput("")
      return
    }

    dispatch({ type: "submitGuess", guess: word, puzzle })
    setInput("")

    if (result.status === "win") {
      setTimeout(() => setShowWin(true), 380)
    }
  }, [
    input,
    puzzle,
    state.solved,
    state.guesses,
    triggerShake,
    triggerGuessShake,
  ])

  const reset = useCallback(() => {
    if (!puzzle) return
    dispatch({ type: "reset" })
    setShowWin(false)
    setHintsUsed(0)
    setInput("")
    clearGameState(puzzle.puzzleId)
  }, [puzzle])

  return {
    puzzle,
    isPending,
    isFetching,
    error,
    mode,
    guesses: state.guesses,
    sortedGuesses,
    latestId: state.highlightedGuessId,
    pinnedGuessId,
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
    hint,
    hintEnabled: canHint,
    guessesUntilHint: canHint
      ? 0
      : nearoConfig.hintThreshold -
        (state.guesses.length % nearoConfig.hintThreshold),
    reset,
  }
}
