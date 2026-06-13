import { getTemperatureColor } from "@/lib/temperature"
import type { GameStatus, WordGuess } from "../types"

type StatusCardProps = {
  bestScore: number | null
  bestGuess: WordGuess | null
  guessCount: number
  status: GameStatus
}

const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export const StatusCard = ({
  bestScore,
  bestGuess,
  guessCount,
  status,
}: StatusCardProps) => {
  const progress = bestScore === null ? 0 : bestScore / 100
  const gaugeColor =
    bestScore === null ? "var(--border)" : getTemperatureColor(progress)

  return (
    <div className="mx-4 mt-1 mb-2 flex items-center gap-3.5 rounded-[1.125rem] border border-border bg-card px-4 py-3.5 shadow-sm">
      <div className="relative h-[3.75rem] w-[3.75rem] shrink-0">
        <svg width="60" height="60" className="-rotate-90">
          <circle
            cx="30"
            cy="30"
            r={RADIUS}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="6"
          />
          <circle
            cx="30"
            cy="30"
            r={RADIUS}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            style={{
              transition:
                "stroke-dashoffset 0.5s cubic-bezier(.34,1.56,.64,1), stroke 0.4s",
            }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-mono text-[1.0625rem] font-bold">
          {bestScore === null ? "–" : `${Math.round(bestScore)}%`}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display text-[1.0625rem] leading-[1.15] tracking-[-0.01em]">
          {status.lead}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {bestGuess ? (
            <>
              best:{" "}
              <b className="font-semibold text-foreground">{bestGuess.word}</b>
              {bestGuess.rank ? (
                <> · rank #{bestGuess.rank.toLocaleString()}</>
              ) : null}
            </>
          ) : (
            status.sub
          )}
        </p>
      </div>

      <div className="shrink-0 border-l border-border pl-3 text-center">
        <b className="block font-display text-xl leading-none">{guessCount}</b>
        <span className="font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
          GUESSES
        </span>
      </div>
    </div>
  )
}
