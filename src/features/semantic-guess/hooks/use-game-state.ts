import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { GuessEntry } from "../types"
import { hintAboveBest, PUZZLE_ID, scoreGuess } from "../lib/demo-puzzle"
import { getStatusMessage, normalizeGuess, sortGuesses } from "../lib/engine"
import { clearGameState, loadGameState, saveGameState } from "../lib/storage"

const TOAST_DURATION = 1800

export const useGameState = () => {
  const [guesses, setGuesses] = useState<GuessEntry[]>([])
  const [latestId, setLatestId] = useState<number | null>(null)
  const [input, setInput] = useState("")
  const [toast, setToast] = useState("")
  const [shake, setShake] = useState(false)
  const [won, setWon] = useState(false)
  const [showWin, setShowWin] = useState(false)

  const nextIdRef = useRef(1)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  useEffect(() => {
    const saved = loadGameState(PUZZLE_ID)
    if (!saved) return
    nextIdRef.current = saved.nextId
    setGuesses(saved.guesses)
    setWon(saved.won)
    if (saved.won) setShowWin(true)
  }, [])

  useEffect(() => {
    saveGameState(PUZZLE_ID, { guesses, won, nextId: nextIdRef.current })
  }, [guesses, won])

  const bestScore = useMemo(
    () =>
      guesses.length === 0
        ? null
        : guesses.reduce((m, g) => Math.max(m, g.score), -Infinity),
    [guesses]
  )

  const bestGuess = useMemo(
    () =>
      guesses.reduce<GuessEntry | null>(
        (b, g) => (!b || g.score > b.score ? g : b),
        null
      ),
    [guesses]
  )

  const status = useMemo(
    () => getStatusMessage(bestScore, bestGuess),
    [bestScore, bestGuess]
  )

  const sortedGuesses = useMemo(() => sortGuesses(guesses), [guesses])

  const flashToast = useCallback((msg: string) => {
    setToast(msg)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(""), TOAST_DURATION)
  }, [])

  const triggerShake = useCallback(() => {
    setShake(true)
    setTimeout(() => setShake(false), 340)
  }, [])

  const submit = useCallback(
    (rawWord?: string) => {
      const word = normalizeGuess(rawWord ?? input)
      if (!word || won) return

      const result = scoreGuess(word)

      if (result.status === "invalid") {
        triggerShake()
        flashToast("letters only, please")
        return
      }

      if (result.status === "unknown") {
        triggerShake()
        flashToast(`"${word}" is not in our word list`)
        return
      }

      if (guesses.some((g) => g.word === word)) {
        flashToast(`already tried "${word}"`)
        setInput("")
        return
      }

      if (result.status === "win") {
        const id = nextIdRef.current++
        const entry: GuessEntry = { id, word, score: 1, rank: 1 }
        setGuesses((prev) => [...prev, entry])
        setLatestId(id)
        setInput("")
        setWon(true)
        setTimeout(() => setShowWin(true), 380)
        return
      }

      const id = nextIdRef.current++
      const entry: GuessEntry = {
        id,
        word,
        score: result.score,
        rank: result.rank,
      }
      setGuesses((prev) => [...prev, entry])
      setLatestId(id)
      setInput("")
    },
    [input, won, guesses, flashToast, triggerShake]
  )

  const hint = useCallback(() => {
    if (won) return
    const nudge = hintAboveBest(bestScore ?? 0)
    if (!nudge) {
      flashToast("no warmer hint available")
      return
    }
    submit(nudge)
    flashToast("✨ hint added a warmer word")
  }, [won, bestScore, submit, flashToast])

  const reset = useCallback(() => {
    setGuesses([])
    setLatestId(null)
    setWon(false)
    setShowWin(false)
    setInput("")
    nextIdRef.current = 1
    clearGameState(PUZZLE_ID)
  }, [])

  return {
    guesses,
    sortedGuesses,
    latestId,
    input,
    setInput,
    toast,
    shake,
    won,
    showWin,
    setShowWin,
    bestScore,
    bestGuess,
    status,
    submit,
    hint,
    reset,
  }
}
