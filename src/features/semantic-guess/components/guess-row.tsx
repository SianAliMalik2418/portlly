import { getTemperatureColor } from "@/lib/temperature"
import { motion } from "framer-motion"
import { getTemperatureLabel } from "../lib/engine"
import type { GuessEntry } from "../types"

type GuessRowProps = {
  guess: GuessEntry
  isNew: boolean
}

export const GuessRow = ({ guess, isNew }: GuessRowProps) => {
  const color = getTemperatureColor(guess.score)
  const label = getTemperatureLabel(guess.score)

  return (
    <motion.div
      initial={isNew ? { opacity: 0, transform: "scale(0.9)" } : false}
      animate={{ opacity: 1, transform: "scale(1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="flex items-center gap-2.5 rounded-xl px-3 py-[0.6875rem]"
      style={{
        background: `color-mix(in srgb, ${color} 22%, var(--card))`,
        borderLeft: `5px solid ${color}`,
        border: `1.5px solid color-mix(in srgb, ${color} 50%, transparent)`,
        borderLeftWidth: 5,
        borderLeftColor: color,
      }}
    >
      <span className="w-[3.25rem] shrink-0 font-mono text-[11px] text-muted-foreground">
        {guess.rank === 1 ? "★" : `#${guess.rank.toLocaleString()}`}
      </span>
      <span className="flex-1 text-[1.0625rem] font-semibold lowercase">
        {guess.word}
      </span>
      <span
        className="font-mono text-[10px] font-bold tracking-[0.05em] brightness-[0.66] saturate-150"
        style={{ color }}
      >
        {label}
      </span>
      <span
        className="min-w-[2.125rem] rounded-[7px] px-1.5 py-0.5 text-center font-mono text-sm font-bold text-[#1a1813]"
        style={{ background: color }}
      >
        {Math.round(guess.score * 100)}
      </span>
    </motion.div>
  )
}
