import { getScoreColor } from "@/lib/score-color"
import { motion } from "framer-motion"
import type { WordGuess } from "../types"

type GuessRowProps = {
  guess: WordGuess
  isNew: boolean
  isShaking: boolean
  isHighlighted: boolean
}

export const GuessRow = ({
  guess,
  isNew,
  isShaking,
  isHighlighted,
}: GuessRowProps) => {
  const color = getScoreColor(guess.score / 100)

  return (
    <motion.div
      layout
      layoutId={`guess-${guess.id}`}
      initial={isNew ? { opacity: 0, transform: "scale(0.95)" } : false}
      animate={{ opacity: 1, transform: "scale(1)" }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 28 },
        opacity: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
        transform: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
      }}
      className={`flex min-h-14 items-center gap-3 rounded-[0.95rem] border border-border bg-card px-4 py-2.5 ${
        isShaking ? "animate-[shake_0.32s]" : ""
      }`}
      style={{
        boxShadow: isHighlighted
          ? `0 0 0 2px color-mix(in srgb, ${color} 34%, transparent)`
          : "0 0 0 0 transparent",
        transition: "box-shadow 0.24s ease",
      }}
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold"
        style={{
          background: `color-mix(in srgb, ${color} 13%, var(--card))`,
          color,
        }}
      >
        {guess.id}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground lowercase">
        {guess.word}
      </span>
      {guess.rank ? (
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          {guess.rank === 1 ? "★" : `#${guess.rank.toLocaleString()}`}
        </span>
      ) : null}
      <span
        className="min-w-12 rounded-[0.75rem] border px-2.5 py-1.5 text-center font-mono text-xs font-bold"
        style={{
          background: `color-mix(in srgb, ${color} 14%, var(--card))`,
          borderColor: `color-mix(in srgb, ${color} 28%, var(--border))`,
          color,
        }}
      >
        {guess.rank === 1 ? 100 : Math.min(99, Math.round(guess.score))}%
      </span>
    </motion.div>
  )
}
