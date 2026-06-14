import { useQuery } from "@tanstack/react-query"
import { useGameState } from "./hooks/use-game-state"
import { useGameTour } from "./hooks/use-game-tour"
import { archiveDaysQueryOptions } from "./data/puzzle"
import { GameNav } from "./components/game-nav"
import { ArchiveStrip } from "./components/archive-strip"
import { StatusCard } from "./components/status-card"
import { GuessList } from "./components/guess-list"
import { GuessInput } from "./components/guess-input"
import { WinModal } from "./components/win-modal"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { RefreshCw, TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"

type NearoProps = {
  mode: "daily" | "archive"
  date?: string
  children?: ReactNode
}

export const Nearo = ({ mode, date, children }: NearoProps) => {
  const game = useGameState({ mode, date })
  const gameReady = !game.isPending && !game.error && !!game.puzzle
  const { tourActive } = useGameTour(gameReady)
  const { data: archiveDays = [] } = useQuery(archiveDaysQueryOptions())
  const selectedDate =
    mode === "archive"
      ? (date ?? null)
      : (archiveDays.find((day) => day.isToday)?.date ?? null)

  if (game.isPending) {
    return (
      <>
        <div className="flex h-dvh items-center justify-center bg-background">
          <Loader
            label="Loading Nearo puzzle"
            texts={[
              mode === "archive"
                ? "Loading the archived Nearo puzzle"
                : "Loading today's Nearo puzzle",
              "Calibrating meaning scores",
              "Preparing your guess board",
            ]}
            iconClassName="size-11"
            textContainerClassName="max-w-[18rem]"
          />
        </div>
        {children}
      </>
    )
  }

  if (game.error || !game.puzzle) {
    const puzzleLabel =
      mode === "archive" ? "this archived puzzle" : "today's puzzle"

    return (
      <>
        <div className="flex h-dvh items-center justify-center bg-background px-6">
          <Empty className="max-w-[26rem] flex-none rounded-[1.5rem] border border-border bg-card p-6 shadow-[0_0.75rem_2rem_color-mix(in_srgb,var(--foreground)_7%,transparent)]">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-full bg-destructive/10 text-destructive"
              >
                <TriangleAlert className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Couldn&apos;t load Nearo</EmptyTitle>
              <EmptyDescription>
                We couldn&apos;t fetch {puzzleLabel}. Check your connection,
                then try again.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="gap-3">
              <Button
                className="w-full rounded-full"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="size-4" />
                Try again
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Any saved Nearo progress stays in this browser.
              </p>
            </EmptyContent>
          </Empty>
        </div>
        {children}
      </>
    )
  }

  return (
    <>
      <div
        className="flex h-dvh flex-col bg-background"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--card) 95%, transparent), transparent 34rem), linear-gradient(180deg, color-mix(in srgb, var(--background) 96%, white), var(--background))",
        }}
      >
        <div className="mx-auto flex min-h-0 w-full max-w-[43rem] flex-1 flex-col">
          <GameNav selectedDate={selectedDate} />
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
            showExample={tourActive && game.guesses.length === 0}
          />
          <GuessInput
            input={game.input}
            shake={game.shake}
            won={game.won}
            hintEnabled={game.hintEnabled}
            guessesUntilHint={game.guessesUntilHint}
            onInputChange={game.setInput}
            onSubmit={game.submit}
            onHint={game.hint}
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

      {children}
    </>
  )
}
