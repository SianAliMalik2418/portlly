import { getScoreColor } from "@/lib/score-color"
import type { GameStatus, WordGuess } from "../types"

type StatusCardProps = {
  bestScore: number | null
  bestGuess: WordGuess | null
  guessCount: number
  status: GameStatus
}

export const StatusCard = ({
  bestScore,
  bestGuess,
  guessCount,
  status,
}: StatusCardProps) => {
  const isAnswer = bestGuess?.rank === 1
  const score = bestScore === null ? null : isAnswer ? 100 : Math.min(99, Math.round(bestScore))
  const progress = bestScore === null ? 0 : bestScore / 100
  const scoreColor =
    bestScore === null ? "var(--muted-foreground)" : getScoreColor(progress)
  const guessLabel = `${guessCount} ${guessCount === 1 ? "guess" : "guesses"}`
  const circumference = 2 * Math.PI * 42

  return (
    <div className="mx-6 mb-5 rounded-[1.125rem] border border-border bg-card px-4 py-4">
      <div className="flex items-center gap-4">
        <div className="min-w-18 shrink-0 rounded-[0.875rem] bg-foreground/10 px-3 py-3 text-center text-foreground sm:hidden">
          <b className="block font-display text-xl leading-none">
            {guessCount}
          </b>
          <span className="mt-1.5 block text-[11px] font-bold tracking-wide uppercase">
            {guessCount === 1 ? "Guess" : "Guesses"}
          </span>
        </div>

        <div className="relative hidden size-24 shrink-0 place-items-center sm:grid">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke="color-mix(in srgb, var(--destructive) 12%, var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{
                transition:
                  "stroke-dashoffset 0.5s cubic-bezier(.34,1.56,.64,1), stroke 0.4s",
              }}
            />
          </svg>
          <span
            className="font-display text-lg font-bold"
            style={{ color: scoreColor }}
          >
            {score === null ? "--" : `${score}%`}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-sm leading-tight font-bold text-foreground sm:text-base">
            {status.lead}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {bestGuess ? (
              <>
                Best guess:{" "}
                <b className="font-semibold text-foreground">
                  {bestGuess.word}
                </b>
                {bestGuess.rank ? (
                  <> · rank #{bestGuess.rank.toLocaleString()}</>
                ) : null}
              </>
            ) : (
              status.sub
            )}
          </p>
        </div>

        <div className="hidden h-20 w-px bg-border sm:block" />
        <div className="hidden min-w-18 shrink-0 rounded-[0.875rem] bg-foreground/10 px-3 py-3 text-center text-foreground sm:block">
          <b className="block font-display text-xl leading-none">
            {guessCount}
          </b>
          <span className="mt-1.5 block text-[11px] font-bold tracking-wide uppercase">
            {guessCount === 1 ? "Guess" : "Guesses"}
          </span>
        </div>
      </div>
    </div>
  )
}
