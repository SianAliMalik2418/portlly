import type { WordGuess } from "@/games/word/types"
import { EmptyState } from "./empty-state"
import { GuessRow } from "./guess-row"

type GuessListProps = {
  guesses: WordGuess[]
  latestId: number | null
}

export const GuessList = ({ guesses, latestId }: GuessListProps) => (
  <div className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col overflow-y-auto px-4 py-1">
    {guesses.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="flex flex-col gap-1.5">
        {guesses.map((guess) => (
          <GuessRow
            key={guess.id}
            guess={guess}
            isNew={guess.id === latestId}
          />
        ))}
      </div>
    )}
  </div>
)
