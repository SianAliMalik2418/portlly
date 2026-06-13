import { LayoutGroup } from "framer-motion"
import type { WordGuess } from "../types"
import { EmptyState } from "./empty-state"
import { GuessRow } from "./guess-row"

type GuessListProps = {
  guesses: WordGuess[]
  latestId: number | null
  shakingGuessId: number | null
}

export const GuessList = ({ guesses, latestId, shakingGuessId }: GuessListProps) => (
  <div className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col overflow-y-auto px-4 py-1">
    {guesses.length === 0 ? (
      <EmptyState />
    ) : (
      <LayoutGroup>
        <div aria-label="Guess history" className="flex flex-col gap-1.5">
          {guesses.map((guess) => (
            <GuessRow
              key={guess.id}
              guess={guess}
              isNew={guess.id === latestId}
              isShaking={guess.id === shakingGuessId}
            />
          ))}
        </div>
      </LayoutGroup>
    )}
  </div>
)
