import { Button } from "@/components/ui/button"
import type { TickrRunResult } from "../types"
import { GameNav } from "./game-nav"

type ResultScreenProps = {
  result: TickrRunResult
  onPlayAgain: () => void
  onChangePreset: () => void
}

export const ResultScreen = ({
  result,
  onPlayAgain,
  onChangePreset,
}: ResultScreenProps) => (
  <main className="min-h-dvh bg-background text-foreground">
    <GameNav />
    <div className="mx-auto flex w-full max-w-[52rem] items-center px-5 py-8 sm:px-8">
      <section className="mx-auto w-full max-w-[34rem] rounded-lg border border-border bg-card p-5 text-center shadow-[0_1rem_2rem_color-mix(in_srgb,var(--foreground)_8%,transparent)]">
        <p className="font-mono text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
          {result.newBest ? "New best" : "Run ended"}
        </p>
        <h1 className="mt-3 text-6xl font-black tabular-nums">
          {result.correctCount}
        </h1>
        <p className="mt-2 text-muted-foreground">correct answers</p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-muted p-3">
            <div className="font-mono text-lg font-black">
              {result.elapsedSeconds.toFixed(1)}
            </div>
            <div className="mt-1 font-mono text-[0.625rem] font-bold text-muted-foreground uppercase">
              seconds
            </div>
          </div>
          <div className="rounded-md bg-muted p-3">
            <div className="font-mono text-lg font-black">
              {result.bestStreak}
            </div>
            <div className="mt-1 font-mono text-[0.625rem] font-bold text-muted-foreground uppercase">
              streak
            </div>
          </div>
          <div className="rounded-md bg-muted p-3">
            <div className="font-mono text-lg font-black">
              {result.bestScore}
            </div>
            <div className="mt-1 font-mono text-[0.625rem] font-bold text-muted-foreground uppercase">
              best
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button size="lg" onClick={onPlayAgain}>
            Play again
          </Button>
          <Button size="lg" variant="outline" onClick={onChangePreset}>
            Change clock
          </Button>
        </div>
      </section>
    </div>
  </main>
)
