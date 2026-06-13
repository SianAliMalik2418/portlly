import { useQuery } from "@tanstack/react-query"
import { useGameState } from "./hooks/use-game-state"
import { archiveDaysQueryOptions } from "./data/puzzle"
import { GameNav } from "./components/game-nav"
import { ArchiveStrip } from "./components/archive-strip"
import { StatusCard } from "./components/status-card"
import { GuessList } from "./components/guess-list"
import { GuessInput } from "./components/guess-input"
import { WinModal } from "./components/win-modal"

type NearoProps = {
  mode: "daily" | "archive"
  date?: string
}

export const Nearo = ({ mode, date }: NearoProps) => {
  const game = useGameState({ mode, date })
  const { data: archiveDays = [] } = useQuery(archiveDaysQueryOptions())
  const selectedDate =
    mode === "archive"
      ? (date ?? null)
      : (archiveDays.find((day) => day.isToday)?.date ?? null)

  if (game.isPending) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading puzzle…</p>
      </div>
    )
  }

  if (game.error || !game.puzzle) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-muted-foreground">
          Failed to load the puzzle. Try refreshing.
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex h-dvh flex-col bg-background"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--card) 95%, transparent), transparent 34rem), linear-gradient(180deg, color-mix(in srgb, var(--background) 96%, white), var(--background))",
      }}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[43rem] flex-1 flex-col">
        <GameNav mode={mode} selectedDate={selectedDate} />
        <ArchiveStrip
          days={archiveDays}
          selectedDate={selectedDate}
          activePuzzleId={game.puzzle.puzzleId}
          activeGuessCount={game.guesses.length}
          activeWon={game.won}
        />
        <StatusCard
          bestScore={game.bestScore}
          bestGuess={game.bestGuess}
          guessCount={game.guesses.length}
          status={game.status}
        />
        <GuessList
          guesses={game.sortedGuesses}
          latestId={game.latestId}
          shakingGuessId={game.shakingGuessId}
          pinnedGuessId={game.pinnedGuessId}
        />
        <GuessInput
          input={game.input}
          shake={game.shake}
          won={game.won}
          onInputChange={game.setInput}
          onSubmit={game.submit}
        />
      </div>

      <WinModal
        open={game.showWin}
        guesses={game.guesses}
        puzzleId={game.puzzle.puzzleId}
        onReset={game.reset}
        onClose={() => game.setShowWin(false)}
      />
    </div>
  )
}
