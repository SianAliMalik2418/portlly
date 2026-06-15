import { LayoutGroup } from "framer-motion"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WordGuess } from "../types"
import { GuessRow } from "./guess-row"

type GuessListProps = {
  className?: string
  guesses: WordGuess[]
  latestId: number | null
  shakingGuessId: number | null
  pinnedGuessId: number | null
  showExample?: boolean
}

const TOUR_SAMPLE_GUESS: WordGuess = {
  id: -1,
  word: "ocean",
  rank: 42,
  score: 58,
}

export const GuessList = ({
  className,
  guesses,
  latestId,
  shakingGuessId,
  pinnedGuessId,
  showExample = false,
}: GuessListProps) => {
  const visibleGuesses =
    guesses.length === 0 && showExample ? [TOUR_SAMPLE_GUESS] : guesses

  return (
    <div
      id="nearo-guesses"
      className={cn(
        "flex min-h-0 flex-1 [scrollbar-width:none] flex-col overflow-y-auto px-3 py-1 sm:px-4",
        className
      )}
    >
      {visibleGuesses.length === 0 ? null : (
        <LayoutGroup>
          <div className="mx-3 mt-2 mb-5 flex items-center gap-3 sm:mx-4">
            <Sparkles className="size-6 shrink-0 text-[oklch(0.80_0.16_75)]" />
            <h2 className="font-display text-sm font-bold text-foreground">
              Your guesses
            </h2>
            <div className="h-px flex-1 border-t border-dashed border-border" />
          </div>

          <div
            aria-label={showExample ? "Example guess" : "Guess history"}
            className="flex flex-col gap-3 px-3 sm:px-4"
          >
            {visibleGuesses.map((guess) => (
              <GuessRow
                key={guess.id}
                guess={guess}
                isNew={guess.id === latestId}
                isShaking={guess.id === shakingGuessId}
                isHighlighted={guess.id === pinnedGuessId}
              />
            ))}
          </div>
        </LayoutGroup>
      )}
    </div>
  )
}
