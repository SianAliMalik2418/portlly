import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
      className={`flex min-h-12 items-center gap-3 rounded-lg px-3 py-2.5 ${
        isShaking ? "animate-[shake_0.32s]" : ""
      }`}
      style={{
        background: `color-mix(in srgb, ${color} 12%, var(--card))`,
        border: `1px solid color-mix(in srgb, ${color} 32%, var(--border))`,
        borderLeftColor: color,
        borderLeftWidth: 4,
        boxShadow: isHighlighted
          ? `0 0 0 2px color-mix(in srgb, ${color} 44%, transparent)`
          : "0 0 0 0 transparent",
        transition: "box-shadow 0.24s ease",
      }}
    >
      <span className="w-[3.75rem] shrink-0 font-mono text-[11px] text-muted-foreground">
        {guess.rank === 1 ? (
          "★"
        ) : guess.rank ? (
          `#${guess.rank.toLocaleString()}`
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">···</span>
              </TooltipTrigger>
              <TooltipContent>
                Not close enough — try a more related word
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-base font-semibold lowercase">
        {guess.word}
      </span>
      <span
        className="min-w-12 rounded-md px-2 py-1 text-center font-mono text-sm font-bold text-[#1a1813]"
        style={{ background: color }}
      >
        {Math.round(guess.score)}%
      </span>
    </motion.div>
  )
}
