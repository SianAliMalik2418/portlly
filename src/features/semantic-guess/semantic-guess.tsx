import { useGameState } from "./hooks/use-game-state"
import { GameNav } from "./components/game-nav"
import { StatusCard } from "./components/status-card"
import { GuessList } from "./components/guess-list"
import { GuessInput } from "./components/guess-input"
import { WinModal } from "./components/win-modal"

export const SemanticGuess = () => {
  const game = useGameState()

  if (game.isPending) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="text-muted-foreground">Loading puzzle…</p>
      </div>
    )
  }

  if (game.error || !game.puzzle) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="text-3xl">😵</span>
        <p className="text-muted-foreground">Failed to load today's puzzle. Try refreshing.</p>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[36.25rem] min-h-0 flex-1 flex-col">
        <GameNav puzzleId={game.puzzle.puzzleId} />
        <StatusCard
          bestScore={game.bestScore}
          bestGuess={game.bestGuess}
          guessCount={game.guesses.length}
          status={game.status}
        />
        <GuessList guesses={game.sortedGuesses} latestId={game.latestId} />
        <GuessInput
          input={game.input}
          toast={game.toast}
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
