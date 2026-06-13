import { getScoreColor } from "@/lib/score-color"
import { motion } from "framer-motion"
import type { WordGuess } from "../types"

type GuessRowProps = {
  guess: WordGuess
  isNew: boolean
  isShaking: boolean
}

export const GuessRow = ({ guess, isNew, isShaking }: GuessRowProps) => {
  const normalized = guess.score / 100
  const color = getScoreColor(normalized)

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
      className={`flex items-center gap-2.5 rounded-xl px-3 py-[0.6875rem]${isShaking ? " animate-[shake_0.32s]" : ""}`}
      style={{
        background: `color-mix(in srgb, ${color} 22%, var(--card))`,
        borderLeft: `5px solid ${color}`,
        border: `1.5px solid color-mix(in srgb, ${color} 50%, transparent)`,
        borderLeftWidth: 5,
        borderLeftColor: color,
      }}
    >
      <span className="w-[3.25rem] shrink-0 font-mono text-[11px] text-muted-foreground">
        {guess.rank === 1
          ? "★"
          : guess.rank
            ? `#${guess.rank.toLocaleString()}`
            : "···"}
      </span>
      <span className="flex-1 text-[1.0625rem] font-semibold lowercase">
        {guess.word}
      </span>
      <span
        className="min-w-[2.125rem] rounded-[7px] px-1.5 py-0.5 text-center font-mono text-sm font-bold text-[#1a1813]"
        style={{ background: color }}
      >
        {Math.round(guess.score)}%
      </span>
    </motion.div>
  )
}
