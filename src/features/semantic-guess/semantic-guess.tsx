import { useGameState } from "./hooks/use-game-state"
import { GameNav } from "./components/game-nav"
import { StatusCard } from "./components/status-card"
import { GuessList } from "./components/guess-list"
import { GuessInput } from "./components/guess-input"
import { WinModal } from "./components/win-modal"

export const SemanticGuess = () => {
  const game = useGameState()

  return (
    <div className="flex h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[36.25rem] min-h-0 flex-1 flex-col">
        <GameNav />
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
          onHint={game.hint}
        />
      </div>

      <WinModal
        open={game.showWin}
        guesses={game.guesses}
        onReset={game.reset}
        onClose={() => game.setShowWin(false)}
      />
    </div>
  )
}
