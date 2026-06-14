import { Button } from "@/components/ui/button"
import { nearoConfig } from "../config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useRef, useState } from "react"
import confetti from "canvas-confetti"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { CalendarDays, CheckCircle2, Circle, Clock3 } from "lucide-react"
import type { WordGuess } from "../types"
import { archiveDaysQueryOptions } from "../data/puzzle"
import { loadGameState } from "../lib/storage"

type WinModalProps = {
  open: boolean
  guesses: WordGuess[]
  puzzleId: string
  onReset: () => void
  onClose: () => void
}

type DayStatus = "new" | "started" | "solved"

const getStatus = (puzzleId: string): DayStatus => {
  const saved = loadGameState(puzzleId)
  if (!saved) return "new"
  if (saved.won) return "solved"
  if (saved.guesses.length > 0) return "started"
  return "new"
}

export const WinModal = ({
  open,
  guesses,
  puzzleId,
  onReset,
  onClose,
}: WinModalProps) => {
  const [showArchive, setShowArchive] = useState(false)
  const { data: archiveDays = [] } = useQuery(archiveDaysQueryOptions())
  const firedRef = useRef(false)

  useEffect(() => {
    if (!open || firedRef.current) return
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
  }, [open])

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

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent
        className="max-w-[26.25rem] rounded-[1.5rem] border-border p-0 text-center [&>button]:hidden"
        style={{ animation: "dialogIn 300ms cubic-bezier(0.23,1,0.32,1)" }}
      >
        <div className="px-5.5 py-6.5">
          <span className="text-[3.25rem]">🏆</span>
          <DialogTitle className="mt-1.5 font-display text-[1.875rem] font-bold tracking-[-0.02em]">
            You found it!
          </DialogTitle>
          <DialogDescription className="sr-only">
            Puzzle solved summary.
          </DialogDescription>

          <div className="mt-4.5 flex gap-2.5">
            {[
              { value: guesses.length, label: "GUESSES" },
              {
                value: guesses.find((g) => g.score === 100)?.word ?? "—",
                label: "SECRET WORD",
              },
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

          <div className="mt-5 flex flex-col gap-2.5">
            <Button
              className="btn-press rounded-full"
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
              className="btn-press rounded-full"
              onClick={onReset}
            >
              Play again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
