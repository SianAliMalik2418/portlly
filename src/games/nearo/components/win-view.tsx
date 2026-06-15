import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, isToday, isYesterday, parseISO } from "date-fns"
import confetti from "canvas-confetti"
import { CalendarDays, CheckCircle2, Circle, Clock3, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getScoreColor } from "@/lib/score-color"
import { nearoConfig } from "../config"
import { archiveDaysQueryOptions } from "../data/puzzle"
import { loadGameState } from "../lib/storage"
import type { WordGuess } from "../types"

type WinViewProps = {
  guesses: WordGuess[]
  puzzleId: string
  mode: "daily" | "archive"
  date?: string
  onReset: () => void
}

const getTimeUntilMidnightUtc = () => {
  const now = new Date()
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  )
  return Math.max(0, tomorrow.getTime() - now.getTime())
}

const formatCountdown = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const useCountdown = () => {
  const [remaining, setRemaining] = useState(getTimeUntilMidnightUtc)

  useEffect(() => {
    const id = setInterval(() => setRemaining(getTimeUntilMidnightUtc()), 1000)
    return () => clearInterval(id)
  }, [])

  return formatCountdown(remaining)
}

const getWinLabel = (mode: "daily" | "archive", date?: string) => {
  if (mode === "daily") return "You found today's word!"
  if (!date) return "You found it!"
  const parsed = parseISO(date)
  if (isToday(parsed)) return "You found today's word!"
  if (isYesterday(parsed)) return "You found yesterday's word!"
  return `You found the word for ${format(parsed, "MMM d")}!`
}

type DayStatus = "new" | "started" | "solved"

const getStatus = (puzzleId: string): DayStatus => {
  const saved = loadGameState(puzzleId)
  if (!saved) return "new"
  if (saved.won) return "solved"
  if (saved.guesses.length > 0) return "started"
  return "new"
}

export const WinView = ({ guesses, puzzleId, mode, date, onReset }: WinViewProps) => {
  const countdown = useCountdown()
  const [showArchive, setShowArchive] = useState(false)
  const { data: archiveDays = [] } = useQuery(archiveDaysQueryOptions())
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true

    const end = Date.now() + 600
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  const [statuses, setStatuses] = useState<Record<string, DayStatus>>({})

  useEffect(() => {
    if (archiveDays.length === 0) return
    setStatuses(
      Object.fromEntries(
        archiveDays.map((day) => {
          const status =
            day.puzzleId === puzzleId ? "solved" : getStatus(day.puzzleId)
          return [day.date, status] as const
        })
      )
    )
  }, [archiveDays, puzzleId])

  const sortedDays = [...archiveDays].sort((a, b) =>
    b.date.localeCompare(a.date)
  )

  const secretWord = guesses.find((g) => g.score === 100)?.word ?? "—"
  const sorted = [...guesses].sort((a, b) => b.score - a.score)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-1 [scrollbar-width:none] sm:px-4">
      <div className="px-3 pt-6 pb-4 text-center sm:px-4">
        <span className="text-[3.25rem]">🏆</span>
        <h2 className="mt-1.5 font-display text-[1.875rem] font-bold tracking-[-0.02em]">
          {getWinLabel(mode, date)}
        </h2>

        <div className="mx-auto mt-4 flex max-w-sm gap-2.5">
          {[
            { value: guesses.length, label: "GUESSES" },
            { value: secretWord, label: "SECRET WORD" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 rounded-xl bg-muted px-1.5 py-3"
            >
              <b className="block font-display text-xl">{stat.value}</b>
              <span className="font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {mode === "daily" && (
          <div className="mt-4 text-center">
            <span className="font-mono text-lg font-bold tracking-wider text-foreground">
              {countdown}
            </span>
            <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
              Next puzzle
            </p>
          </div>
        )}

        <div className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-2.5">
          <Button
            className="rounded-full"
            onClick={() => setShowArchive(!showArchive)}
          >
            <CalendarDays className="size-4" />
            {showArchive ? "Hide previous words" : "Play previous words"}
          </Button>

          {showArchive && sortedDays.length > 0 && (
            <div className="mt-1 max-h-[12rem] space-y-1.5 overflow-y-auto rounded-xl border border-border bg-background p-2 text-left">
              {sortedDays.map((day) => {
                const status = statuses[day.date] ?? "new"
                const isCurrent = day.puzzleId === puzzleId
                const href = day.isToday
                  ? nearoConfig.route
                  : `${nearoConfig.archiveRoute}/${day.date}`
                const StatusIcon =
                  status === "solved"
                    ? CheckCircle2
                    : status === "started"
                      ? Clock3
                      : Circle

                return (
                  <a
                    key={day.date}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 no-underline transition-colors ${
                      isCurrent
                        ? "pointer-events-none bg-primary/8 text-primary"
                        : status === "solved"
                          ? "bg-emerald-500/5 text-foreground hover:bg-emerald-500/12"
                          : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <StatusIcon
                      className={`size-3.5 shrink-0 ${
                        isCurrent
                          ? "text-primary"
                          : status === "solved"
                            ? "text-emerald-500"
                            : status === "started"
                              ? "text-amber-500"
                              : "text-muted-foreground/40"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-none font-semibold">
                        {day.isToday
                          ? "Today"
                          : format(parseISO(day.date), "EEEE")}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] leading-none text-muted-foreground">
                        {format(parseISO(day.date), "MMM d")}
                      </span>
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Current
                      </span>
                    )}
                    {status === "solved" && !isCurrent && (
                      <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                        Solved
                      </span>
                    )}
                    {status === "started" && (
                      <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        In progress
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          )}

          <Button
            variant="outline"
            className="rounded-full"
            onClick={onReset}
          >
            Play again
          </Button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-3 px-3 pb-6 sm:px-4">
        {sorted.map((guess) => {
          const color = getScoreColor(guess.score / 100)
          return (
            <div
              key={guess.id}
              className="flex min-h-14 items-center gap-3 rounded-[0.95rem] border border-border bg-card px-4 py-2.5"
            >
              <span className="grid h-8 w-16 shrink-0 place-items-center rounded-full bg-muted/50 font-mono text-xs font-bold text-muted-foreground">
                {guess.rank
                  ? guess.rank === 1
                    ? "★"
                    : `#${guess.rank.toLocaleString()}`
                  : "–"}
              </span>
              <span className="h-6 w-px shrink-0 bg-border" />
              <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm font-semibold text-foreground lowercase">
                {guess.word}
                {guess.isHint && (
                  <Lightbulb className="size-3.5 shrink-0 text-amber-500" />
                )}
              </span>
              <span
                className="min-w-12 rounded-[0.75rem] border px-2.5 py-1.5 text-center font-mono text-xs font-bold"
                style={{
                  background: `color-mix(in srgb, ${color} 14%, var(--card))`,
                  borderColor: `color-mix(in srgb, ${color} 28%, var(--border))`,
                  color,
                }}
              >
                {guess.rank === 1
                  ? 100
                  : Math.min(99, Math.round(guess.score))}
                %
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
