import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { format, parseISO } from "date-fns"
import { CheckCircle2, ChevronDown, Circle, Clock3 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { nearoConfig } from "../config"
import type { ArchiveDay } from "../data/puzzle"
import { loadGameState } from "../lib/storage"

type ArchiveStripProps = {
  days: ArchiveDay[]
  selectedDate: string | null
  activePuzzleId: string | null
  activeGuessCount: number
  activeWon: boolean
}

type DayStatus = "new" | "started" | "solved"

const getDayLabel = (date: string, isToday: boolean) => {
  if (isToday) return "Today"

  return format(parseISO(date), "EEE")
}

const getDateLabel = (date: string) => format(parseISO(date), "MM/dd")

const getStatus = (puzzleId: string): DayStatus => {
  const saved = loadGameState(puzzleId)

  if (!saved) return "new"
  if (saved.won) return "solved"
  if (saved.guesses.length > 0) return "started"

  return "new"
}

export const ArchiveStrip = ({
  days,
  selectedDate,
  activePuzzleId,
  activeGuessCount,
  activeWon,
}: ArchiveStripProps) => {
  const [statuses, setStatuses] = useState<Record<string, DayStatus>>({})
  const activeDate = selectedDate ?? days.find((day) => day.isToday)?.date
  const activeDay = days.find((day) => day.date === activeDate)
  const [open, setOpen] = useState(() => activeDay?.isToday === false)
  const orderedDays = useMemo(() => days, [days])

  useEffect(() => {
    setStatuses(
      Object.fromEntries(
        days.map((day) => {
          const status =
            day.puzzleId === activePuzzleId
              ? activeWon
                ? "solved"
                : activeGuessCount > 0
                  ? "started"
                  : getStatus(day.puzzleId)
              : getStatus(day.puzzleId)

          return [day.date, status] as const
        })
      )
    )
  }, [activeGuessCount, activePuzzleId, activeWon, days])

  useEffect(() => {
    if (activeDay?.isToday === false) {
      setOpen(true)
    }
  }, [activeDay?.isToday])

  if (orderedDays.length === 0) return null

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-y border-border bg-card/60 px-3 py-3 sm:px-4"
    >
      <div className="mx-auto max-w-[44rem]">
        <CollapsibleTrigger
          className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-left text-foreground transition-colors outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/30"
          aria-label="Toggle previous words"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              Play previous words
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Catch up on the last 7 daily puzzles.
            </span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent
        aria-label="Recent puzzles"
        className="mx-auto mt-3 max-w-[44rem] [scrollbar-width:none] overflow-x-auto"
      >
        <div className="flex w-max min-w-full justify-start gap-2 lg:justify-center">
          {orderedDays.map((day) => {
            const status = statuses[day.date] ?? "new"
            const isActive = day.date === activeDate
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
                aria-current={isActive ? "page" : undefined}
                className={`flex min-w-[5.25rem] shrink-0 items-center gap-2 rounded-lg border px-2.5 py-3 text-left no-underline transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <StatusIcon className="size-3.5 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm leading-none font-semibold">
                    {getDayLabel(day.date, day.isToday)}
                  </span>
                  <span
                    className={`mt-1 block font-mono text-[10px] leading-none ${
                      isActive
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground"
                    }`}
                  >
                    {getDateLabel(day.date)}
                  </span>
                </span>
              </a>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
